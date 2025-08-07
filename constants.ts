
export const MEMORY_SIZE = 0x10000; // 64KB
export const SCREEN_WIDTH = 64;
export const SCREEN_HEIGHT = 64;
export const SCREEN_MEMORY_START = 0xC000;
export const SCREEN_MEMORY_SIZE = SCREEN_WIDTH * SCREEN_HEIGHT;
export const SCREEN_MEMORY_END = SCREEN_MEMORY_START + SCREEN_MEMORY_SIZE - 1;

export const CONSOLE_OUTPUT_PORT = 0xF001;

export const COLOR_PALETTE = [
  "#000000", "#FFFFFF", "#880000", "#AAFFEE",
  "#CC44CC", "#00CC55", "#0000AA", "#EEEE77",
  "#DD8855", "#664400", "#FF7777", "#333333",
  "#777777", "#AAFF66", "#0088FF", "#BBBBBB",
];

export const DEFAULT_SOURCE_CODE = `; 6502 Screen Drawing Demo
; Draws some patterns on the 64x64 screen
; Screen memory is mapped from $C000 to $CFFF

.org $8000

START:
  ; Fill background with color 13 (light green)
  LDA #13
  LDX #0
  LDY #0
FILL_BG:
  STA $C000,X
  DEX
  BNE FILL_BG
  INY
  CPY #$40 ; 64 rows
  BNE FILL_BG


  ; Draw a blue (6) rectangle
  LDA #6
  LDY #8
OUTER_RECT:
  LDX #8
INNER_RECT:
  STA $C000 + (16*64) + 16, Y ; Offset by X and Y
  INX
  CPX #48
  BNE INNER_RECT
  INY
  CPY #48
  BNE OUTER_RECT

  ; Draw a red (2) cross
  LDA #2
  LDX #0
CROSS_LOOP:
  ; Diagonal top-left to bottom-right
  STA $C000 + (8*64) + 8, X
  ; Diagonal top-right to bottom-left
  STA $C000 + (8*64) + 55, X
  INX
  CPX #48
  BNE CROSS_LOOP

DONE:
  JMP DONE ; Infinite loop to show result

`;
