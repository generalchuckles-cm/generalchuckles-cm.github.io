
import type { AssemblyResult } from '../types';

const opcodes: { [key: string]: { [key: string]: { opcode: number, bytes: number } } } = {
    'ADC': { 'imm': { opcode: 0x69, bytes: 2 }, 'zp': { opcode: 0x65, bytes: 2 }, 'zpx': { opcode: 0x75, bytes: 2 }, 'abs': { opcode: 0x6D, bytes: 3 }, 'absx': { opcode: 0x7D, bytes: 3 }, 'absy': { opcode: 0x79, bytes: 3 }, 'indx': { opcode: 0x61, bytes: 2 }, 'indy': { opcode: 0x71, bytes: 2 } },
    'AND': { 'imm': { opcode: 0x29, bytes: 2 }, 'zp': { opcode: 0x25, bytes: 2 }, 'zpx': { opcode: 0x35, bytes: 2 }, 'abs': { opcode: 0x2D, bytes: 3 }, 'absx': { opcode: 0x3D, bytes: 3 }, 'absy': { opcode: 0x39, bytes: 3 }, 'indx': { opcode: 0x21, bytes: 2 }, 'indy': { opcode: 0x31, bytes: 2 } },
    'ASL': { 'acc': { opcode: 0x0A, bytes: 1 }, 'zp': { opcode: 0x06, bytes: 2 }, 'zpx': { opcode: 0x16, bytes: 2 }, 'abs': { opcode: 0x0E, bytes: 3 }, 'absx': { opcode: 0x1E, bytes: 3 } },
    'BCC': { 'rel': { opcode: 0x90, bytes: 2 } }, 'BCS': { 'rel': { opcode: 0xB0, bytes: 2 } }, 'BEQ': { 'rel': { opcode: 0xF0, bytes: 2 } },
    'BIT': { 'zp': { opcode: 0x24, bytes: 2 }, 'abs': { opcode: 0x2C, bytes: 3 } },
    'BMI': { 'rel': { opcode: 0x30, bytes: 2 } }, 'BNE': { 'rel': { opcode: 0xD0, bytes: 2 } }, 'BPL': { 'rel': { opcode: 0x10, bytes: 2 } },
    'BRK': { 'imp': { opcode: 0x00, bytes: 1 } }, 'BVC': { 'rel': { opcode: 0x50, bytes: 2 } }, 'BVS': { 'rel': { opcode: 0x70, bytes: 2 } },
    'CLC': { 'imp': { opcode: 0x18, bytes: 1 } }, 'CLD': { 'imp': { opcode: 0xD8, bytes: 1 } }, 'CLI': { 'imp': { opcode: 0x58, bytes: 1 } }, 'CLV': { 'imp': { opcode: 0xB8, bytes: 1 } },
    'CMP': { 'imm': { opcode: 0xC9, bytes: 2 }, 'zp': { opcode: 0xC5, bytes: 2 }, 'zpx': { opcode: 0xD5, bytes: 2 }, 'abs': { opcode: 0xCD, bytes: 3 }, 'absx': { opcode: 0xDD, bytes: 3 }, 'absy': { opcode: 0xD9, bytes: 3 }, 'indx': { opcode: 0xC1, bytes: 2 }, 'indy': { opcode: 0xD1, bytes: 2 } },
    'CPX': { 'imm': { opcode: 0xE0, bytes: 2 }, 'zp': { opcode: 0xE4, bytes: 2 }, 'abs': { opcode: 0xEC, bytes: 3 } },
    'CPY': { 'imm': { opcode: 0xC0, bytes: 2 }, 'zp': { opcode: 0xC4, bytes: 2 }, 'abs': { opcode: 0xCC, bytes: 3 } },
    'DEC': { 'zp': { opcode: 0xC6, bytes: 2 }, 'zpx': { opcode: 0xD6, bytes: 2 }, 'abs': { opcode: 0xCE, bytes: 3 }, 'absx': { opcode: 0xDE, bytes: 3 } },
    'DEX': { 'imp': { opcode: 0xCA, bytes: 1 } }, 'DEY': { 'imp': { opcode: 0x88, bytes: 1 } },
    'EOR': { 'imm': { opcode: 0x49, bytes: 2 }, 'zp': { opcode: 0x45, bytes: 2 }, 'zpx': { opcode: 0x55, bytes: 2 }, 'abs': { opcode: 0x4D, bytes: 3 }, 'absx': { opcode: 0x5D, bytes: 3 }, 'absy': { opcode: 0x59, bytes: 3 }, 'indx': { opcode: 0x41, bytes: 2 }, 'indy': { opcode: 0x51, bytes: 2 } },
    'INC': { 'zp': { opcode: 0xE6, bytes: 2 }, 'zpx': { opcode: 0xF6, bytes: 2 }, 'abs': { opcode: 0xEE, bytes: 3 }, 'absx': { opcode: 0xFE, bytes: 3 } },
    'INX': { 'imp': { opcode: 0xE8, bytes: 1 } }, 'INY': { 'imp': { opcode: 0xC8, bytes: 1 } },
    'JMP': { 'abs': { opcode: 0x4C, bytes: 3 }, 'ind': { opcode: 0x6C, bytes: 3 } },
    'JSR': { 'abs': { opcode: 0x20, bytes: 3 } },
    'LDA': { 'imm': { opcode: 0xA9, bytes: 2 }, 'zp': { opcode: 0xA5, bytes: 2 }, 'zpx': { opcode: 0xB5, bytes: 2 }, 'abs': { opcode: 0xAD, bytes: 3 }, 'absx': { opcode: 0xBD, bytes: 3 }, 'absy': { opcode: 0xB9, bytes: 3 }, 'indx': { opcode: 0xA1, bytes: 2 }, 'indy': { opcode: 0xB1, bytes: 2 } },
    'LDX': { 'imm': { opcode: 0xA2, bytes: 2 }, 'zp': { opcode: 0xA6, bytes: 2 }, 'zpy': { opcode: 0xB6, bytes: 2 }, 'abs': { opcode: 0xAE, bytes: 3 }, 'absy': { opcode: 0xBE, bytes: 3 } },
    'LDY': { 'imm': { opcode: 0xA0, bytes: 2 }, 'zp': { opcode: 0xA4, bytes: 2 }, 'zpx': { opcode: 0xB4, bytes: 2 }, 'abs': { opcode: 0xAC, bytes: 3 }, 'absx': { opcode: 0xBC, bytes: 3 } },
    'LSR': { 'acc': { opcode: 0x4A, bytes: 1 }, 'zp': { opcode: 0x46, bytes: 2 }, 'zpx': { opcode: 0x56, bytes: 2 }, 'abs': { opcode: 0x4E, bytes: 3 }, 'absx': { opcode: 0x5E, bytes: 3 } },
    'NOP': { 'imp': { opcode: 0xEA, bytes: 1 } },
    'ORA': { 'imm': { opcode: 0x09, bytes: 2 }, 'zp': { opcode: 0x05, bytes: 2 }, 'zpx': { opcode: 0x15, bytes: 2 }, 'abs': { opcode: 0x0D, bytes: 3 }, 'absx': { opcode: 0x1D, bytes: 3 }, 'absy': { opcode: 0x19, bytes: 3 }, 'indx': { opcode: 0x01, bytes: 2 }, 'indy': { opcode: 0x11, bytes: 2 } },
    'PHA': { 'imp': { opcode: 0x48, bytes: 1 } }, 'PHP': { 'imp': { opcode: 0x08, bytes: 1 } }, 'PLA': { 'imp': { opcode: 0x68, bytes: 1 } }, 'PLP': { 'imp': { opcode: 0x28, bytes: 1 } },
    'ROL': { 'acc': { opcode: 0x2A, bytes: 1 }, 'zp': { opcode: 0x26, bytes: 2 }, 'zpx': { opcode: 0x36, bytes: 2 }, 'abs': { opcode: 0x2E, bytes: 3 }, 'absx': { opcode: 0x3E, bytes: 3 } },
    'ROR': { 'acc': { opcode: 0x6A, bytes: 1 }, 'zp': { opcode: 0x66, bytes: 2 }, 'zpx': { opcode: 0x76, bytes: 2 }, 'abs': { opcode: 0x6E, bytes: 3 }, 'absx': { opcode: 0x7E, bytes: 3 } },
    'RTI': { 'imp': { opcode: 0x40, bytes: 1 } }, 'RTS': { 'imp': { opcode: 0x60, bytes: 1 } },
    'SBC': { 'imm': { opcode: 0xE9, bytes: 2 }, 'zp': { opcode: 0xE5, bytes: 2 }, 'zpx': { opcode: 0xF5, bytes: 2 }, 'abs': { opcode: 0xED, bytes: 3 }, 'absx': { opcode: 0xFD, bytes: 3 }, 'absy': { opcode: 0xF9, bytes: 3 }, 'indx': { opcode: 0xE1, bytes: 2 }, 'indy': { opcode: 0xF1, bytes: 2 } },
    'SEC': { 'imp': { opcode: 0x38, bytes: 1 } }, 'SED': { 'imp': { opcode: 0xF8, bytes: 1 } }, 'SEI': { 'imp': { opcode: 0x78, bytes: 1 } },
    'STA': { 'zp': { opcode: 0x85, bytes: 2 }, 'zpx': { opcode: 0x95, bytes: 2 }, 'abs': { opcode: 0x8D, bytes: 3 }, 'absx': { opcode: 0x9D, bytes: 3 }, 'absy': { opcode: 0x99, bytes: 3 }, 'indx': { opcode: 0x81, bytes: 2 }, 'indy': { opcode: 0x91, bytes: 2 } },
    'STX': { 'zp': { opcode: 0x86, bytes: 2 }, 'zpy': { opcode: 0x96, bytes: 2 }, 'abs': { opcode: 0x8E, bytes: 3 } },
    'STY': { 'zp': { opcode: 0x84, bytes: 2 }, 'zpx': { opcode: 0x94, bytes: 2 }, 'abs': { opcode: 0x8C, bytes: 3 } },
    'TAX': { 'imp': { opcode: 0xAA, bytes: 1 } }, 'TAY': { 'imp': { opcode: 0xA8, bytes: 1 } },
    'TSX': { 'imp': { opcode: 0xBA, bytes: 1 } }, 'TXA': { 'imp': { opcode: 0x8A, bytes: 1 } }, 'TXS': { 'imp': { opcode: 0x9A, bytes: 1 } }, 'TYA': { 'imp': { opcode: 0x98, bytes: 1 } }
};

const valueRegex = /\$([0-9a-fA-F]+)|%([01]+)|(\d+)/;
function parseValue(val: string, labels: Map<string, number>, errors: string[], lineNum: number): number | null {
    val = val.trim();
    if (labels.has(val)) {
        return labels.get(val)!;
    }
    const match = val.match(valueRegex);
    if (!match) {
        errors.push(`Line ${lineNum}: Invalid value format: ${val}`);
        return null;
    }
    if (match[1]) return parseInt(match[1], 16); // Hex
    if (match[2]) return parseInt(match[2], 2);  // Binary
    if (match[3]) return parseInt(match[3], 10);  // Decimal
    return null;
}

export function assemble(source: string): AssemblyResult {
    const lines = source.split('\n');
    const errors: string[] = [];
    const labels = new Map<string, number>();
    let pc = 0x8000;
    let startAddress = pc;

    // Pass 1: Collect labels
    let currentPc = startAddress;
    lines.forEach((line, index) => {
        line = line.replace(/;.*$/, '').trim();
        if (line.length === 0) return;
        
        const labelMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):/);
        if (labelMatch) {
            const label = labelMatch[1].toUpperCase();
            if (labels.has(label)) {
                errors.push(`Line ${index + 1}: Duplicate label '${label}'`);
            }
            labels.set(label, currentPc);
            line = line.substring(labelMatch[0].length).trim();
            if(line.length === 0) return;
        }

        const parts = line.split(/\s+/);
        const mnemonic = parts[0].toUpperCase();
        const operand = parts.slice(1).join(' ').trim();
        
        if (mnemonic === ".ORG") {
            const val = parseValue(operand, new Map(), errors, index+1);
            if(val !== null) currentPc = val;
            return;
        } else if (mnemonic === ".BYTE") {
            const stringMatch = operand.match(/^"([^"]*)"/);
            if (stringMatch) {
                currentPc += stringMatch[1].length;
            } else {
                currentPc += operand.split(',').length;
            }
            return;
        }

        const op = opcodes[mnemonic];
        if (!op) {
            errors.push(`Line ${index + 1}: Unknown mnemonic '${mnemonic}'`);
            return;
        }

        let mode = '';
        if (operand.length === 0 || operand.toUpperCase() === 'A') mode = operand.length === 0 ? 'imp' : 'acc';
        else if (operand.startsWith('#')) mode = 'imm';
        else if (operand.match(/^\(\$[0-9a-fA-F]+,X\)$/i) || operand.match(/^\(.+,X\)$/i)) mode = 'indx';
        else if (operand.match(/^\(\$[0-9a-fA-F]+\),Y$/i) || operand.match(/^\(.+\),Y$/i)) mode = 'indy';
        else if (operand.match(/^\(\$[0-9a-fA-F]+\)$/i) || operand.match(/^\(.+\)$/i)) mode = 'ind';
        else if (operand.match(/,X$/i)) mode = operand.length > 5 ? 'absx' : 'zpx';
        else if (operand.match(/,Y$/i)) mode = operand.length > 5 ? 'absy' : 'zpy';
        else if (op['rel']) mode = 'rel';
        else mode = operand.length > 5 ? 'abs' : 'zp';

        const instruction = op[mode] || op['abs'] || op['zp'];
        if (!instruction) {
            errors.push(`Line ${index+1}: Invalid addressing mode for ${mnemonic}: ${operand}`);
            return;
        }
        currentPc += instruction.bytes;
    });

    if (errors.length > 0) return { machineCode: new Uint8Array(), errors, startAddress, map: new Map() };

    // Pass 2: Generate code
    const machineCode: number[] = [];
    const map = new Map<number, number>();
    currentPc = startAddress;
    lines.forEach((line, index) => {
        line = line.replace(/;.*$/, '').trim();
        const originalLine = line;
        if (line.length === 0) return;

        line = line.replace(/^([a-zA-Z_][a-zA-Z0-9_]*):/, '').trim();
        if (line.length === 0) return;

        const parts = line.split(/\s+/);
        const mnemonic = parts[0].toUpperCase();
        let operand = parts.slice(1).join(' ');

        if (mnemonic === ".ORG") {
            const val = parseValue(operand, labels, errors, index+1);
            if (val !== null) currentPc = val;
            return;
        } else if (mnemonic === ".BYTE") {
            const stringMatch = operand.match(/^"([^"]*)"/);
            if (stringMatch) {
                for (let i = 0; i < stringMatch[1].length; i++) {
                    machineCode.push(stringMatch[1].charCodeAt(i));
                }
            } else {
                operand.split(',').forEach(v => {
                    const val = parseValue(v, labels, errors, index+1);
                    if (val !== null) machineCode.push(val & 0xFF);
                });
            }
            return;
        }

        const op = opcodes[mnemonic];
        if (!op) return;

        map.set(currentPc, index);

        let mode = '';
        if (operand.length === 0 || operand.toUpperCase() === 'A') mode = operand.length === 0 ? 'imp' : 'acc';
        else if (operand.startsWith('#')) mode = 'imm';
        else if (operand.match(/^\(.*\s*,\s*X\)$/i)) mode = 'indx';
        else if (operand.match(/^\(.*\)\s*,\s*Y$/i)) mode = 'indy';
        else if (operand.match(/^\(.*\)$/i)) mode = 'ind';
        else if (operand.match(/,\s*X$/i)) {
            const addr = operand.replace(/,\s*X$/i, '').trim();
            const val = parseValue(addr, labels, errors, index+1);
            mode = (val !== null && val <= 0xFF) && op['zpx'] ? 'zpx' : 'absx';
        }
        else if (operand.match(/,\s*Y$/i)) {
            const addr = operand.replace(/,\s*Y$/i, '').trim();
            const val = parseValue(addr, labels, errors, index+1);
            mode = (val !== null && val <= 0xFF) && op['zpy'] ? 'zpy' : 'absy';
        }
        else if (op['rel']) mode = 'rel';
        else {
            const val = parseValue(operand, labels, errors, index+1);
            mode = (val !== null && val <= 0xFF) && op['zp'] ? 'zp' : 'abs';
        }

        let instruction = op[mode];
        if(!instruction && mode === 'abs') instruction = op['zp'];
        if(!instruction && mode === 'zp') instruction = op['abs'];

        if (!instruction) {
            errors.push(`Line ${index+1}: Invalid addressing mode for ${mnemonic}: ${operand}`);
            return;
        }
        
        machineCode.push(instruction.opcode);
        currentPc++;
        
        if (instruction.bytes > 1) {
            const operandValStr = operand.replace(/#|\(|\)|,X|,Y/gi, '').trim();
            let operandVal = parseValue(operandValStr, labels, errors, index+1);
            
            if (operandVal === null) {
                errors.push(`Line ${index+1}: Could not parse operand: ${operandValStr}`);
                operandVal = 0;
            }

            if (mode === 'rel') {
                const offset = operandVal - (currentPc + 1);
                if (offset < -128 || offset > 127) {
                    errors.push(`Line ${index+1}: Branch target out of range.`);
                }
                machineCode.push(offset & 0xFF);
            } else {
                 machineCode.push(operandVal & 0xFF);
                if (instruction.bytes === 3) {
                    machineCode.push((operandVal >> 8) & 0xFF);
                }
            }
        }
        currentPc += instruction.bytes - 1;
    });

    return { machineCode: new Uint8Array(machineCode), errors, startAddress, map };
}
