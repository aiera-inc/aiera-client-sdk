import { MicroArrowUp } from '@aiera/client-sdk/components/Svg/MicroArrowUp';
import { MicroFolder } from '@aiera/client-sdk/components/Svg/MicroFolder';
import classNames from 'classnames';
import React, { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { MicroFolderOpen } from '../../../../../components/Svg/MicroFolderOpen';
import { useChatStore } from '../../../store';
import { Hint } from '../../Hint';
import './styles.css';

interface PromptProps {
    onOpenSources: () => void;
    onSubmit: (prompt: string) => void;
}

export function Prompt({ onSubmit, onOpenSources }: PromptProps) {
    const { sources } = useChatStore();
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
    }, [checkEmpty]);

    const handleSubmit = useCallback(() => {
        if (inputRef.current) {
            const promptText = inputRef.current.innerText;
            if (promptText && promptText.length > 0) {
                onSubmit(promptText);
                inputRef.current.textContent = '';
                setTimeout(checkEmpty);
            }
        }
    }, [onSubmit, sources.length, checkEmpty]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLParagraphElement>) => {
            checkEmpty();
            if (e.code === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
            }
        },
        [checkEmpty, handleSubmit]
    );

    // Autofocus
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
        checkEmpty();
    }, [checkEmpty]);

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
                    'rounded-xl flex-shrink-0 flex items-center justify-center',
                    'cursor-pointer hover:bg-slate-100 active:bg-slate-200 active:scale-90',
                    'hintTarget relative',
                    {
                        'text-rose-600': sources.length > 0,
                        'text-slate-400': sources.length === 0,
                    }
                )}
            >
                {sources.length > 0 ? (
                    <>
                        <p className="text-sm font-bold antialiased mr-0.5">{sources.length}</p>
                        <MicroFolderOpen className="w-4" />
                    </>
                ) : (
                    <MicroFolder className="w-4" />
                )}
                <Hint
                    targetHeight={30}
                    targetWidth={28}
                    text={sources.length === 0 ? 'Auto Sources' : 'Manage Sources'}
                    anchor={'top-right'}
                    grow={'up-left'}
                    yOffset={8}
                />
            </button>
            <button
                onClick={handleSubmit}
                className={classNames(
                    'h-[1.875rem] self-end mb-1 mr-[5px] w-[1.875rem] transition-all',
                    'bg-blue-600 rounded-xl flex-shrink-0 flex items-center justify-center',
                    'cursor-pointer hover:bg-blue-700 active:bg-blue-800 active:scale-90',
                    'relative hintTarget'
                )}
            >
                <MicroArrowUp className="w-4 text-white" />
                <Hint
                    targetHeight={30}
                    targetWidth={28}
                    yOffset={8}
                    text={'Ask Question'}
                    anchor={'top-right'}
                    grow={'up-left'}
                />
            </button>
        </div>
    );
}
