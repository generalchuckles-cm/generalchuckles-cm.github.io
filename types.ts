
export interface CpuState {
  A: number;
  X: number;
  Y: number;
  PC: number;
  SP: number;
  P: number;
}

export interface AssemblyResult {
  machineCode: Uint8Array;
  errors: string[];
  startAddress: number;
  map: Map<number, number>; // Map from machine code address to source line number
}

export enum Flag {
  C = 1 << 0, // Carry
  Z = 1 << 1, // Zero
  I = 1 << 2, // Interrupt Disable
  D = 1 << 3, // Decimal Mode
  B = 1 << 4, // Break
  U = 1 << 5, // Unused
  V = 1 << 6, // Overflow
  N = 1 << 7, // Negative
}
