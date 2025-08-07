
import React from 'react';

interface EditorProps {
  sourceCode: string;
  onSourceCodeChange: (code: string) => void;
  errors: string[];
}

const Editor: React.FC<EditorProps> = ({ sourceCode, onSourceCodeChange, errors }) => {
  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-inner">
      <h2 className="text-lg font-bold p-3 bg-gray-700 rounded-t-lg">Assembly Code</h2>
      <textarea
        value={sourceCode}
        onChange={(e) => onSourceCodeChange(e.target.value)}
        className="w-full flex-grow p-3 bg-gray-800 text-mono font-mono text-sm resize-none focus:outline-none"
        spellCheck="false"
      />
      {errors.length > 0 && (
        <div className="bg-red-900 p-3 rounded-b-lg overflow-y-auto max-h-24">
          <h3 className="font-bold text-red-300">Assembly Errors:</h3>
          <ul className="text-red-300 text-sm font-mono">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Editor;
