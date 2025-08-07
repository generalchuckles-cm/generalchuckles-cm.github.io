
import React, { useRef, useEffect } from 'react';

interface ConsoleProps {
  output: string;
}

const Console: React.FC<ConsoleProps> = ({ output }) => {
  const endOfConsoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfConsoleRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output]);

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-inner">
      <h2 className="text-lg font-bold p-3 bg-gray-700 rounded-t-lg">Console</h2>
      <pre className="w-full flex-grow p-3 bg-gray-900 text-mono font-mono text-sm overflow-y-auto rounded-b-lg">
        {output}
        <div ref={endOfConsoleRef} />
      </pre>
    </div>
  );
};

export default Console;
