
import type { CpuState } from '../types';
import { Flag } from '../types';

export class CPU {
  A: number = 0;
  X: number = 0;
  Y: number = 0;
  PC: number = 0;
  SP: number = 0xFD;
  P: number = Flag.U | Flag.I;
  memory: Uint8Array;
  onConsoleOut: (char: string) => void;

  constructor(memory: Uint8Array, onConsoleOut: (char: string) => void) {
    this.memory = memory;
    this.onConsoleOut = onConsoleOut;
    this.reset();
  }

  reset() {
    this.A = this.X = this.Y = 0;
    this.P = Flag.U | Flag.I;
    this.SP = 0xFD;
    this.PC = this.read16(0xFFFC);
  }
  
  getRegisters(): CpuState {
      return { A: this.A, X: this.X, Y: this.Y, PC: this.PC, SP: this.SP, P: this.P };
  }

  setFlag(flag: Flag, value: boolean) {
    if (value) this.P |= flag;
    else this.P &= ~flag;
  }
  getFlag(flag: Flag): boolean {
    return (this.P & flag) > 0;
  }

  read(addr: number): number { 
      if (addr === 0xF001) return 0; // Console read not impl.
      return this.memory[addr & 0xFFFF]; 
  }
  write(addr: number, data: number) {
    addr &= 0xFFFF;
    if (addr === 0xF001) {
        this.onConsoleOut(String.fromCharCode(data));
    }
    this.memory[addr] = data & 0xFF;
  }
  read16(addr: number): number {
    const lo = this.read(addr);
    const hi = this.read(addr + 1);
    return (hi << 8) | lo;
  }

  push(data: number) { this.write(0x0100 + this.SP--, data); }
  pop(): number { return this.read(0x0100 + ++this.SP); }
  push16(data: number) { this.push((data >> 8) & 0xFF); this.push(data & 0xFF); }
  pop16(): number { const lo = this.pop(); const hi = this.pop(); return (hi << 8) | lo; }

  // Addressing Modes
  addrImm(): number { return this.PC++; }
  addrZp(): number { return this.read(this.PC++); }
  addrZpx(): number { return (this.read(this.PC++) + this.X) & 0xFF; }
  addrZpy(): number { return (this.read(this.PC++) + this.Y) & 0xFF; }
  addrAbs(): number { const addr = this.read16(this.PC); this.PC += 2; return addr; }
  addrAbsx(): number { return this.addrAbs() + this.X; }
  addrAbsy(): number { return this.addrAbs() + this.Y; }
  addrInd(): number { const ptr = this.addrAbs(); return this.read16(ptr); }
  addrIndx(): number { const ptr = (this.read(this.PC++) + this.X) & 0xFF; return this.read16(ptr); }
  addrIndy(): number { const ptr = this.read16(this.read(this.PC++)); return ptr + this.Y; }

  // Opcode implementations
  private updateZN(val: number) {
    this.setFlag(Flag.Z, (val & 0xFF) === 0);
    this.setFlag(Flag.N, (val & 0x80) !== 0);
  }
  private ADC(addr: number) {
    const m = this.read(addr);
    const temp = this.A + m + (this.getFlag(Flag.C) ? 1 : 0);
    this.setFlag(Flag.V, (~(this.A ^ m) & (this.A ^ temp) & 0x80) !== 0);
    this.setFlag(Flag.C, temp > 0xFF);
    this.A = temp & 0xFF;
    this.updateZN(this.A);
  }
  private SBC(addr: number) {
    const m = this.read(addr) ^ 0xFF;
    const temp = this.A + m + (this.getFlag(Flag.C) ? 1 : 0);
    this.setFlag(Flag.V, (~(this.A ^ m) & (this.A ^ temp) & 0x80) !== 0);
    this.setFlag(Flag.C, temp > 0xFF);
    this.A = temp & 0xFF;
    this.updateZN(this.A);
  }
  private branch(condition: boolean) {
    const offset = this.read(this.PC++);
    if (condition) {
      this.PC += (offset < 128) ? offset : offset - 256;
    }
  }
  private compare(reg: number, addr: number) {
    const m = this.read(addr);
    const temp = reg - m;
    this.setFlag(Flag.C, reg >= m);
    this.updateZN(temp);
  }

  step() {
    const opcode = this.read(this.PC++);
    let addr: number;
    let val: number;

    switch (opcode) {
        case 0x69: this.ADC(this.addrImm()); break; case 0x65: this.ADC(this.addrZp()); break; case 0x75: this.ADC(this.addrZpx()); break; case 0x6D: this.ADC(this.addrAbs()); break; case 0x7D: this.ADC(this.addrAbsx()); break; case 0x79: this.ADC(this.addrAbsy()); break; case 0x61: this.ADC(this.addrIndx()); break; case 0x71: this.ADC(this.addrIndy()); break;
        case 0x29: this.A &= this.read(this.addrImm()); this.updateZN(this.A); break; case 0x25: this.A &= this.read(this.addrZp()); this.updateZN(this.A); break; case 0x35: this.A &= this.read(this.addrZpx()); this.updateZN(this.A); break; case 0x2D: this.A &= this.read(this.addrAbs()); this.updateZN(this.A); break; case 0x3D: this.A &= this.read(this.addrAbsx()); this.updateZN(this.A); break; case 0x39: this.A &= this.read(this.addrAbsy()); this.updateZN(this.A); break; case 0x21: this.A &= this.read(this.addrIndx()); this.updateZN(this.A); break; case 0x31: this.A &= this.read(this.addrIndy()); this.updateZN(this.A); break;
        case 0x0A: this.setFlag(Flag.C, (this.A & 0x80) !== 0); this.A = (this.A << 1) & 0xFF; this.updateZN(this.A); break; case 0x06: addr = this.addrZp(); val = this.read(addr); this.setFlag(Flag.C, (val & 0x80) !== 0); val = (val << 1) & 0xFF; this.write(addr, val); this.updateZN(val); break; case 0x16: addr = this.addrZpx(); val = this.read(addr); this.setFlag(Flag.C, (val & 0x80) !== 0); val = (val << 1) & 0xFF; this.write(addr, val); this.updateZN(val); break; case 0x0E: addr = this.addrAbs(); val = this.read(addr); this.setFlag(Flag.C, (val & 0x80) !== 0); val = (val << 1) & 0xFF; this.write(addr, val); this.updateZN(val); break; case 0x1E: addr = this.addrAbsx(); val = this.read(addr); this.setFlag(Flag.C, (val & 0x80) !== 0); val = (val << 1) & 0xFF; this.write(addr, val); this.updateZN(val); break;
        case 0x90: this.branch(!this.getFlag(Flag.C)); break; case 0xB0: this.branch(this.getFlag(Flag.C)); break; case 0xF0: this.branch(this.getFlag(Flag.Z)); break; case 0xD0: this.branch(!this.getFlag(Flag.Z)); break; case 0x30: this.branch(this.getFlag(Flag.N)); break; case 0x10: this.branch(!this.getFlag(Flag.N)); break; case 0x50: this.branch(!this.getFlag(Flag.V)); break; case 0x70: this.branch(this.getFlag(Flag.V)); break;
        case 0x24: val = this.read(this.addrZp()); this.setFlag(Flag.Z, (this.A & val) === 0); this.setFlag(Flag.N, (val & 0x80) !== 0); this.setFlag(Flag.V, (val & 0x40) !== 0); break; case 0x2C: val = this.read(this.addrAbs()); this.setFlag(Flag.Z, (this.A & val) === 0); this.setFlag(Flag.N, (val & 0x80) !== 0); this.setFlag(Flag.V, (val & 0x40) !== 0); break;
        case 0x00: this.PC++; this.push16(this.PC); this.push(this.P | Flag.B); this.setFlag(Flag.I, true); this.PC = this.read16(0xFFFE); break;
        case 0x18: this.setFlag(Flag.C, false); break; case 0xD8: this.setFlag(Flag.D, false); break; case 0x58: this.setFlag(Flag.I, false); break; case 0xB8: this.setFlag(Flag.V, false); break;
        case 0xC9: this.compare(this.A, this.addrImm()); break; case 0xC5: this.compare(this.A, this.addrZp()); break; case 0xD5: this.compare(this.A, this.addrZpx()); break; case 0xCD: this.compare(this.A, this.addrAbs()); break; case 0xDD: this.compare(this.A, this.addrAbsx()); break; case 0xD9: this.compare(this.A, this.addrAbsy()); break; case 0xC1: this.compare(this.A, this.addrIndx()); break; case 0xD1: this.compare(this.A, this.addrIndy()); break;
        case 0xE0: this.compare(this.X, this.addrImm()); break; case 0xE4: this.compare(this.X, this.addrZp()); break; case 0xEC: this.compare(this.X, this.addrAbs()); break;
        case 0xC0: this.compare(this.Y, this.addrImm()); break; case 0xC4: this.compare(this.Y, this.addrZp()); break; case 0xCC: this.compare(this.Y, this.addrAbs()); break;
        case 0xC6: addr = this.addrZp(); val = (this.read(addr) - 1) & 0xFF; this.write(addr, val); this.updateZN(val); break; case 0xD6: addr = this.addrZpx(); val = (this.read(addr) - 1) & 0xFF; this.write(addr, val); this.updateZN(val); break; case 0xCE: addr = this.addrAbs(); val = (this.read(addr) - 1) & 0xFF; this.write(addr, val); this.updateZN(val); break; case 0xDE: addr = this.addrAbsx(); val = (this.read(addr) - 1) & 0xFF; this.write(addr, val); this.updateZN(val); break;
        case 0xCA: this.X = (this.X - 1) & 0xFF; this.updateZN(this.X); break; case 0x88: this.Y = (this.Y - 1) & 0xFF; this.updateZN(this.Y); break;
        case 0x49: this.A ^= this.read(this.addrImm()); this.updateZN(this.A); break; case 0x45: this.A ^= this.read(this.addrZp()); this.updateZN(this.A); break; case 0x55: this.A ^= this.read(this.addrZpx()); this.updateZN(this.A); break; case 0x4D: this.A ^= this.read(this.addrAbs()); this.updateZN(this.A); break; case 0x5D: this.A ^= this.read(this.addrAbsx()); this.updateZN(this.A); break; case 0x59: this.A ^= this.read(this.addrAbsy()); this.updateZN(this.A); break; case 0x41: this.A ^= this.read(this.addrIndx()); this.updateZN(this.A); break; case 0x51: this.A ^= this.read(this.addrIndy()); this.updateZN(this.A); break;
        case 0xE6: addr = this.addrZp(); val = (this.read(addr) + 1) & 0xFF; this.write(addr, val); this.updateZN(val); break; case 0xF6: addr = this.addrZpx(); val = (this.read(addr) + 1) & 0xFF; this.write(addr, val); this.updateZN(val); break; case 0xEE: addr = this.addrAbs(); val = (this.read(addr) + 1) & 0xFF; this.write(addr, val); this.updateZN(val); break; case 0xFE: addr = this.addrAbsx(); val = (this.read(addr) + 1) & 0xFF; this.write(addr, val); this.updateZN(val); break;
        case 0xE8: this.X = (this.X + 1) & 0xFF; this.updateZN(this.X); break; case 0xC8: this.Y = (this.Y + 1) & 0xFF; this.updateZN(this.Y); break;
        case 0x4C: this.PC = this.addrAbs(); break; case 0x6C: this.PC = this.addrInd(); break;
        case 0x20: addr = this.addrAbs(); this.push16(this.PC - 1); this.PC = addr; break;
        case 0xA9: this.A = this.read(this.addrImm()); this.updateZN(this.A); break; case 0xA5: this.A = this.read(this.addrZp()); this.updateZN(this.A); break; case 0xB5: this.A = this.read(this.addrZpx()); this.updateZN(this.A); break; case 0xAD: this.A = this.read(this.addrAbs()); this.updateZN(this.A); break; case 0xBD: this.A = this.read(this.addrAbsx()); this.updateZN(this.A); break; case 0xB9: this.A = this.read(this.addrAbsy()); this.updateZN(this.A); break; case 0xA1: this.A = this.read(this.addrIndx()); this.updateZN(this.A); break; case 0xB1: this.A = this.read(this.addrIndy()); this.updateZN(this.A); break;
        case 0xA2: this.X = this.read(this.addrImm()); this.updateZN(this.X); break; case 0xA6: this.X = this.read(this.addrZp()); this.updateZN(this.X); break; case 0xB6: this.X = this.read(this.addrZpy()); this.updateZN(this.X); break; case 0xAE: this.X = this.read(this.addrAbs()); this.updateZN(this.X); break; case 0xBE: this.X = this.read(this.addrAbsy()); this.updateZN(this.X); break;
        case 0xA0: this.Y = this.read(this.addrImm()); this.updateZN(this.Y); break; case 0xA4: this.Y = this.read(this.addrZp()); this.updateZN(this.Y); break; case 0xB4: this.Y = this.read(this.addrZpx()); this.updateZN(this.Y); break; case 0xAC: this.Y = this.read(this.addrAbs()); this.updateZN(this.Y); break; case 0xBC: this.Y = this.read(this.addrAbsx()); this.updateZN(this.Y); break;
        case 0x4A: this.setFlag(Flag.C, (this.A & 1) !== 0); this.A >>= 1; this.updateZN(this.A); break; case 0x46: addr = this.addrZp(); val = this.read(addr); this.setFlag(Flag.C, (val & 1) !== 0); val >>= 1; this.write(addr, val); this.updateZN(val); break; case 0x56: addr = this.addrZpx(); val = this.read(addr); this.setFlag(Flag.C, (val & 1) !== 0); val >>= 1; this.write(addr, val); this.updateZN(val); break; case 0x4E: addr = this.addrAbs(); val = this.read(addr); this.setFlag(Flag.C, (val & 1) !== 0); val >>= 1; this.write(addr, val); this.updateZN(val); break; case 0x5E: addr = this.addrAbsx(); val = this.read(addr); this.setFlag(Flag.C, (val & 1) !== 0); val >>= 1; this.write(addr, val); this.updateZN(val); break;
        case 0xEA: break;
        case 0x09: this.A |= this.read(this.addrImm()); this.updateZN(this.A); break; case 0x05: this.A |= this.read(this.addrZp()); this.updateZN(this.A); break; case 0x15: this.A |= this.read(this.addrZpx()); this.updateZN(this.A); break; case 0x0D: this.A |= this.read(this.addrAbs()); this.updateZN(this.A); break; case 0x1D: this.A |= this.read(this.addrAbsx()); this.updateZN(this.A); break; case 0x19: this.A |= this.read(this.addrAbsy()); this.updateZN(this.A); break; case 0x01: this.A |= this.read(this.addrIndx()); this.updateZN(this.A); break; case 0x11: this.A |= this.read(this.addrIndy()); this.updateZN(this.A); break;
        case 0x48: this.push(this.A); break; case 0x08: this.push(this.P | Flag.B); break; case 0x68: this.A = this.pop(); this.updateZN(this.A); break; case 0x28: this.P = (this.pop() | Flag.U) & ~Flag.B; break;
        case 0x2A: val = this.A; this.A = ((val << 1) | (this.getFlag(Flag.C) ? 1 : 0)) & 0xFF; this.setFlag(Flag.C, (val & 0x80) !== 0); this.updateZN(this.A); break; case 0x26: addr = this.addrZp(); val = this.read(addr); this.write(addr, ((val << 1) | (this.getFlag(Flag.C) ? 1 : 0)) & 0xFF); this.setFlag(Flag.C, (val & 0x80) !== 0); this.updateZN(this.read(addr)); break; case 0x36: addr = this.addrZpx(); val = this.read(addr); this.write(addr, ((val << 1) | (this.getFlag(Flag.C) ? 1 : 0)) & 0xFF); this.setFlag(Flag.C, (val & 0x80) !== 0); this.updateZN(this.read(addr)); break; case 0x2E: addr = this.addrAbs(); val = this.read(addr); this.write(addr, ((val << 1) | (this.getFlag(Flag.C) ? 1 : 0)) & 0xFF); this.setFlag(Flag.C, (val & 0x80) !== 0); this.updateZN(this.read(addr)); break; case 0x3E: addr = this.addrAbsx(); val = this.read(addr); this.write(addr, ((val << 1) | (this.getFlag(Flag.C) ? 1 : 0)) & 0xFF); this.setFlag(Flag.C, (val & 0x80) !== 0); this.updateZN(this.read(addr)); break;
        case 0x6A: val = this.A; this.A = (val >> 1) | (this.getFlag(Flag.C) ? 0x80 : 0); this.setFlag(Flag.C, (val & 1) !== 0); this.updateZN(this.A); break; case 0x66: addr = this.addrZp(); val = this.read(addr); this.write(addr, (val >> 1) | (this.getFlag(Flag.C) ? 0x80 : 0)); this.setFlag(Flag.C, (val & 1) !== 0); this.updateZN(this.read(addr)); break; case 0x76: addr = this.addrZpx(); val = this.read(addr); this.write(addr, (val >> 1) | (this.getFlag(Flag.C) ? 0x80 : 0)); this.setFlag(Flag.C, (val & 1) !== 0); this.updateZN(this.read(addr)); break; case 0x6E: addr = this.addrAbs(); val = this.read(addr); this.write(addr, (val >> 1) | (this.getFlag(Flag.C) ? 0x80 : 0)); this.setFlag(Flag.C, (val & 1) !== 0); this.updateZN(this.read(addr)); break; case 0x7E: addr = this.addrAbsx(); val = this.read(addr); this.write(addr, (val >> 1) | (this.getFlag(Flag.C) ? 0x80 : 0)); this.setFlag(Flag.C, (val & 1) !== 0); this.updateZN(this.read(addr)); break;
        case 0x40: this.P = (this.pop() | Flag.U) & ~Flag.B; this.PC = this.pop16(); break; case 0x60: this.PC = this.pop16() + 1; break;
        case 0xE9: this.SBC(this.addrImm()); break; case 0xE5: this.SBC(this.addrZp()); break; case 0xF5: this.SBC(this.addrZpx()); break; case 0xED: this.SBC(this.addrAbs()); break; case 0xFD: this.SBC(this.addrAbsx()); break; case 0xF9: this.SBC(this.addrAbsy()); break; case 0xE1: this.SBC(this.addrIndx()); break; case 0xF1: this.SBC(this.addrIndy()); break;
        case 0x38: this.setFlag(Flag.C, true); break; case 0xF8: this.setFlag(Flag.D, true); break; case 0x78: this.setFlag(Flag.I, true); break;
        case 0x85: this.write(this.addrZp(), this.A); break; case 0x95: this.write(this.addrZpx(), this.A); break; case 0x8D: this.write(this.addrAbs(), this.A); break; case 0x9D: this.write(this.addrAbsx(), this.A); break; case 0x99: this.write(this.addrAbsy(), this.A); break; case 0x81: this.write(this.addrIndx(), this.A); break; case 0x91: this.write(this.addrIndy(), this.A); break;
        case 0x86: this.write(this.addrZp(), this.X); break; case 0x96: this.write(this.addrZpy(), this.X); break; case 0x8E: this.write(this.addrAbs(), this.X); break;
        case 0x84: this.write(this.addrZp(), this.Y); break; case 0x94: this.write(this.addrZpx(), this.Y); break; case 0x8C: this.write(this.addrAbs(), this.Y); break;
        case 0xAA: this.X = this.A; this.updateZN(this.X); break; case 0xA8: this.Y = this.A; this.updateZN(this.Y); break;
        case 0xBA: this.X = this.SP; this.updateZN(this.X); break; case 0x8A: this.A = this.X; this.updateZN(this.A); break;
        case 0x9A: this.SP = this.X; break; case 0x98: this.A = this.Y; this.updateZN(this.A); break;
        default: break; // Halt on unknown opcode
    }
  }
}
