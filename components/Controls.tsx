
import React from 'react';
import type { CpuState } from '../types';
import { Flag } from '../types';

interface ControlsProps {
  onAssemble: () => void;
  onRun: () => void;
  onStop: () => void;
  onStep: () => void;
  onReset: () => void;
  onDownload: () => void;
  isRunning: boolean;
  cpuState: CpuState;
  hasAssembledCode: boolean;
}

const FlagIndicator: React.FC<{ name: string; active: boolean }> = ({ name, active }) => (
  <span className={`px-2 py-1 rounded ${active ? 'bg-green-500 text-black' : 'bg-gray-600 text-gray-400'}`}>
    {name}
  </span>
);

const Controls: React.FC<ControlsProps> = ({ onAssemble, onRun, onStop, onStep, onReset, onDownload, isRunning, cpuState, hasAssembledCode }) => {
  const buttonClass = "px-4 py-2 rounded-md font-bold text-white transition-colors duration-200";
  const primaryButton = `${buttonClass} bg-indigo-600 hover:bg-indigo-500`;
  const secondaryButton = `${buttonClass} bg-gray-600 hover:bg-gray-500`;
  const dangerButton = `${buttonClass} bg-red-600 hover:bg-red-500`;
  const disabledButton = `${buttonClass} bg-gray-700 text-gray-500 cursor-not-allowed`;

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={onAssemble} className={primaryButton}>Assemble</button>
          {isRunning ? (
             <button onClick={onStop} className={dangerButton}>Stop</button>
          ) : (
            <button onClick={onRun} className={hasAssembledCode ? `${buttonClass} bg-green-600 hover:bg-green-500` : disabledButton} disabled={!hasAssembledCode}>Run</button>
          )}
          <button onClick={onStep} disabled={!hasAssembledCode || isRunning} className={!hasAssembledCode || isRunning ? disabledButton : secondaryButton}>Step</button>
          <button onClick={onReset} className={secondaryButton}>Reset</button>
          <button onClick={onDownload} disabled={!hasAssembledCode} className={!hasAssembledCode ? disabledButton : secondaryButton}>Download .bin</button>
        </div>
        <div className="flex items-center gap-4 font-mono text-sm">
            <div>PC: <span className="font-bold text-green-400">${cpuState.PC.toString(16).toUpperCase().padStart(4, '0')}</span></div>
            <div>A: <span className="font-bold text-green-400">${cpuState.A.toString(16).toUpperCase().padStart(2, '0')}</span></div>
            <div>X: <span className="font-bold text-green-400">${cpuState.X.toString(16).toUpperCase().padStart(2, '0')}</span></div>
            <div>Y: <span className="font-bold text-green-400">${cpuState.Y.toString(16).toUpperCase().padStart(2, '0')}</span></div>
            <div>SP: <span className="font-bold text-green-400">${cpuState.SP.toString(16).toUpperCase().padStart(2, '0')}</span></div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
            <FlagIndicator name="N" active={!!(cpuState.P & Flag.N)} />
            <FlagIndicator name="V" active={!!(cpuState.P & Flag.V)} />
            <FlagIndicator name="-" active={!!(cpuState.P & Flag.U)} />
            <FlagIndicator name="B" active={!!(cpuState.P & Flag.B)} />
            <FlagIndicator name="D" active={!!(cpuState.P & Flag.D)} />
            <FlagIndicator name="I" active={!!(cpuState.P & Flag.I)} />
            <FlagIndicator name="Z" active={!!(cpuState.P & Flag.Z)} />
            <FlagIndicator name="C" active={!!(cpuState.P & Flag.C)} />
        </div>
      </div>
    </div>
  );
};

export default Controls;
