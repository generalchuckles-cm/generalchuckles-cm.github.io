
import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { CpuState, AssemblyResult } from './types';
import Editor from './components/Editor';
import Screen from './components/Screen';
import Console from './components/Console';
import HexDump from './components/HexDump';
import Controls from './components/Controls';
import { assemble } from './services/assembler';
import { CPU } from './services/cpu';
import { MEMORY_SIZE, DEFAULT_SOURCE_CODE } from './constants';

const App: React.FC = () => {
    const [sourceCode, setSourceCode] = useState<string>(DEFAULT_SOURCE_CODE);
    const [assemblyResult, setAssemblyResult] = useState<AssemblyResult | null>(null);
    const [consoleOutput, setConsoleOutput] = useState<string>('');
    const [isRunning, setIsRunning] = useState<boolean>(false);
    
    const cpuRef = useRef<CPU | null>(null);
    const memoryRef = useRef<Uint8Array>(new Uint8Array(MEMORY_SIZE));
    
    const [cpuState, setCpuState] = useState<CpuState>({ A: 0, X: 0, Y: 0, PC: 0, SP: 0, P: 0 });
    const [memoryViewState, setMemoryViewState] = useState<Uint8Array>(new Uint8Array(memoryRef.current));

    const resetEmulator = useCallback(() => {
        setIsRunning(false);
        setConsoleOutput('');
        memoryRef.current.fill(0);
        // Set reset vector
        memoryRef.current[0xFFFC] = 0x00;
        memoryRef.current[0xFFFD] = 0x80;
        
        if (assemblyResult) {
            memoryRef.current.set(assemblyResult.machineCode, assemblyResult.startAddress);
            memoryRef.current[0xFFFC] = assemblyResult.startAddress & 0xFF;
            memoryRef.current[0xFFFD] = (assemblyResult.startAddress >> 8) & 0xFF;
        }

        cpuRef.current = new CPU(memoryRef.current, (char) => {
            setConsoleOutput(prev => prev + char);
        });
        cpuRef.current.reset();

        setCpuState(cpuRef.current.getRegisters());
        setMemoryViewState(new Uint8Array(memoryRef.current));
    }, [assemblyResult]);
    
    useEffect(() => {
        resetEmulator();
    }, [assemblyResult, resetEmulator]);

    const handleAssemble = useCallback(() => {
        setIsRunning(false);
        const result = assemble(sourceCode);
        setAssemblyResult(result);
        if (result.errors.length === 0) {
            resetEmulator();
        }
    }, [sourceCode, resetEmulator]);

    const handleDownload = () => {
        if (assemblyResult && assemblyResult.machineCode.length > 0) {
            const blob = new Blob([assemblyResult.machineCode], { type: "application/octet-stream" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "program.bin";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };
    
    const handleStep = useCallback(() => {
        if (cpuRef.current && !isRunning) {
            cpuRef.current.step();
            setCpuState(cpuRef.current.getRegisters());
            // A quick and dirty way to update memory view without killing performance
            if (cpuRef.current.PC % 16 === 0) {
              setMemoryViewState(new Uint8Array(memoryRef.current));
            }
        }
    }, [isRunning]);
    
    const handleRun = () => setIsRunning(true);
    const handleStop = () => setIsRunning(false);

    useEffect(() => {
        let animationFrameId: number;
        if (isRunning && cpuRef.current) {
            const cpu = cpuRef.current;
            const runCycle = () => {
                // Execute a batch of instructions for performance
                for (let i = 0; i < 1000; i++) {
                    cpu.step();
                }
                setCpuState(cpu.getRegisters());
                setMemoryViewState(new Uint8Array(cpu.memory));
                animationFrameId = requestAnimationFrame(runCycle);
            };
            animationFrameId = requestAnimationFrame(runCycle);
        }
        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isRunning]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4 flex flex-col gap-4">
            <header className="text-center">
                <h1 className="text-4xl font-bold text-green-400">6502 Web Assembler &amp; Emulator</h1>
            </header>

            <Controls
                onAssemble={handleAssemble}
                onRun={handleRun}
                onStop={handleStop}
                onStep={handleStep}
                onReset={resetEmulator}
                onDownload={handleDownload}
                isRunning={isRunning}
                cpuState={cpuState}
                hasAssembledCode={!!(assemblyResult && assemblyResult.errors.length === 0)}
            />

            <main className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-grow">
                <div className="flex flex-col gap-4">
                    <Editor 
                        sourceCode={sourceCode} 
                        onSourceCodeChange={setSourceCode}
                        errors={assemblyResult?.errors || []}
                    />
                </div>
                <div className="flex flex-col gap-4">
                    <Screen memory={memoryViewState} />
                    <Console output={consoleOutput} />
                </div>
            </main>

            <footer className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <HexDump
                    title="Assembled Program"
                    data={assemblyResult?.machineCode || new Uint8Array()}
                    startAddress={assemblyResult?.startAddress}
                    maxHeight="20rem"
                    highlightAddress={null}
                />
                <HexDump
                    title="Memory View"
                    data={memoryViewState}
                    startAddress={0}
                    maxHeight="20rem"
                    highlightAddress={cpuState.PC}
                />
            </footer>
        </div>
    );
};

export default App;
