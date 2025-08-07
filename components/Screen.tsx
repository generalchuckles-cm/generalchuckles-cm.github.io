
import React, { useRef, useEffect } from 'react';
import { SCREEN_WIDTH, SCREEN_HEIGHT, SCREEN_MEMORY_START, COLOR_PALETTE } from '../constants';

interface ScreenProps {
  memory: Uint8Array;
}

const Screen: React.FC<ScreenProps> = ({ memory }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const imageData = ctx.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT);
    for (let y = 0; y < SCREEN_HEIGHT; y++) {
      for (let x = 0; x < SCREEN_WIDTH; x++) {
        const memAddr = SCREEN_MEMORY_START + y * SCREEN_WIDTH + x;
        const colorIndex = memory[memAddr] & 0x0F; // Use lower 4 bits for 16 colors
        const color = COLOR_PALETTE[colorIndex];
        
        const pixelIndex = (y * SCREEN_WIDTH + x) * 4;
        imageData.data[pixelIndex] = parseInt(color.slice(1, 3), 16);
        imageData.data[pixelIndex + 1] = parseInt(color.slice(3, 5), 16);
        imageData.data[pixelIndex + 2] = parseInt(color.slice(5, 7), 16);
        imageData.data[pixelIndex + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);

  }, [memory]);

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-inner">
        <h2 className="text-lg font-bold p-3 bg-gray-700 rounded-t-lg">Screen Output (64x64)</h2>
        <div className="flex-grow flex items-center justify-center p-4">
             <canvas
                ref={canvasRef}
                width={SCREEN_WIDTH}
                height={SCREEN_HEIGHT}
                className="w-full h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
            />
        </div>
    </div>
  );
};

export default Screen;
