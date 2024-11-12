import { MicroArrowUp } from '@aiera/client-sdk/components/Svg/MicroArrowUp';
import { MicroFolder } from '@aiera/client-sdk/components/Svg/MicroFolder';
import classNames from 'classnames';
import React, { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useSourcesStore } from '../store';

interface PromptProps {
    onOpenSources: () => void;
    onSubmit: (prompt: string) => void;
}

export function Prompt({ onSubmit, onOpenSources }: PromptProps) {
    const { sourceMode, sources } = useSourcesStore();
    const [isEmpty, setIsEmpty] = useState(true);
    const inputRef = useRef<HTMLParagraphElement | null>(null);

    const checkEmpty = useCallback(() => {
        if (inputRef.current) {
            const content = inputRef.current.textContent || '';
            setIsEmpty(content.trim() === '');
        }
    }, []);

    const handleInput = useCallback(() => {
        checkEmpty();
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLParagraphElement>) => {
        checkEmpty();
        if (e.code === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }, []);

    const handleSubmit = useCallback(() => {
        if (inputRef.current) {
            const promptText = inputRef.current.innerText;
            onSubmit(promptText);
            inputRef.current.textContent = '';
            setTimeout(checkEmpty);
        }
    }, [onSubmit]);

    // Autofocus
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
        checkEmpty();
    }, []);

    return (
        <div className="mb-5 mx-5 flex min-h-10 relative bg-white rounded-2xl border border-slate-300/80 focus-within:ring-2 ring-yellow-200/80 chatInput">
            <p
                ref={inputRef}
                className="flex-1 py-2 pl-4 text-base outline-none chatPrompt"
                onKeyDown={handleKeyDown}
                onInput={handleInput}
                onBlur={checkEmpty}
                contentEditable
            />

            {isEmpty && (
                <span className="absolute left-4 top-2 z-10 text-base text-slate-500 pointer-events-none">
                    Type your questions here...
                </span>
            )}
            <button
                onClick={onOpenSources}
                className={classNames(
                    'h-[1.875rem] ml-2 self-end mb-1 mr-[5px] px-1.5 transition-all',
                    'rounded-lg flex-shrink-0 flex items-center justify-center',
                    'cursor-pointer hover:bg-slate-100 active:bg-slate-200 active:scale-90',
                    {
                        'text-rose-600': sourceMode === 'manual' && sources.length > 0,
                        'text-slate-400': sourceMode === 'suggest' || sources.length === 0,
                    }
                )}
            >
                {sourceMode === 'manual' && sources.length > 0 && (
                    <p className="text-sm font-bold antialiased mr-0.5">{sources.length}</p>
                )}
                <MicroFolder className="w-4" />
            </button>
            <button
                onClick={handleSubmit}
                className={classNames(
                    'h-[1.875rem] self-end mb-1 mr-[5px] w-[1.875rem] transition-all',
                    'bg-blue-600 rounded-xl flex-shrink-0 flex items-center justify-center',
                    'cursor-pointer hover:bg-blue-700 active:bg-blue-800 active:scale-90'
                )}
            >
                <MicroArrowUp className="w-4 text-white" />
            </button>
        </div>
    );
}
