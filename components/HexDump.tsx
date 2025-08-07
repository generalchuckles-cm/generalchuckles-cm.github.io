import React from 'react';

interface HexDumpProps {
  title: string;
  data: Uint8Array;
  startAddress?: number;
  maxHeight?: string;
  highlightAddress?: number | null;
}

const HexDump: React.FC<HexDumpProps> = ({ title, data, startAddress = 0, maxHeight = '20rem', highlightAddress }) => {
  const rows = [];
  for (let i = 0; i < data.length; i += 16) {
    const chunk = Array.from(data.slice(i, i + 16));
    const address = (startAddress + i).toString(16).toUpperCase().padStart(4, '0');
    
    const hexBytes = chunk.map((byte: number, index: number) => {
        const isHighlighted = (startAddress + i + index) === highlightAddress;
        return `<span class="${isHighlighted ? 'bg-yellow-500 text-black' : ''}">${byte.toString(16).toUpperCase().padStart(2, '0')}</span>`;
    }).join(' ');

    const asciiChars = chunk.map((byte: number) => {
      const char = String.fromCharCode(byte);
      return (byte >= 32 && byte <= 126) ? char.replace('<', '&lt;').replace('>', '&gt;') : '.';
    }).join('');

    rows.push(
      `<div class="flex">` +
      `<span class="text-gray-500">${address}:</span>` +
      `<span class="flex-1 ml-4">${hexBytes}</span>` +
      `<span class="text-green-400">${asciiChars}</span>` +
      `</div>`
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-inner">
      <h2 className="text-lg font-bold p-3 bg-gray-700 rounded-t-lg">{title}</h2>
      <div
        className="font-mono text-xs p-3 overflow-y-auto rounded-b-lg"
        style={{ maxHeight }}
        dangerouslySetInnerHTML={{ __html: rows.join('') }}
      />
    </div>
  );
};

export default HexDump;
