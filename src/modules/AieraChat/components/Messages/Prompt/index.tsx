import { MicroArrowUp } from '@aiera/client-sdk/components/Svg/MicroArrowUp';
import { MicroFolder } from '@aiera/client-sdk/components/Svg/MicroFolder';
import { ChatSessionStatus } from '@aiera/client-sdk/types';
import classNames from 'classnames';
import React, { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { MicroFolderOpen } from '../../../../../components/Svg/MicroFolderOpen';
import { useChatStore } from '../../../store';
import { Hint } from '../../Hint';
import './styles.css';

interface PromptProps {
    onOpenSources: () => void;
    onSubmit: (prompt: string) => void;
    submitting: boolean;
}

export function Prompt({ onSubmit, onOpenSources, submitting }: PromptProps) {
    const { chatStatus, sources } = useChatStore();
    const [isEmpty, setIsEmpty] = useState<boolean>(true);
    const inputRef = useRef<HTMLParagraphElement | null>(null);

    // Disable submission if submitting or if chat is in a non-active state
    const isDisabled = submitting || chatStatus !== ChatSessionStatus.Active;
    const checkEmpty = useCallback(() => {
        if (inputRef.current) {
            const content = inputRef.current.textContent || '';
            setIsEmpty(content.trim() === '');
        }
    }, []);

    const handleInput = useCallback(() => {
        if (inputRef.current) {
            // Store cursor position
            const selection = window.getSelection();
            let cursorPosition = 0;
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                cursorPosition = range.startOffset;
            }

            // Get plain text content and normalize it
            const plainText = inputRef.current.textContent || '';

            // Only update if content has HTML or if textContent differs from innerHTML
            if (inputRef.current.innerHTML !== plainText) {
                inputRef.current.textContent = plainText;

                // Restore cursor position
                if (selection && inputRef.current.firstChild) {
                    const range = document.createRange();
                    const textNode = inputRef.current.firstChild;
                    const maxOffset = textNode.textContent?.length || 0;
                    range.setStart(textNode, Math.min(cursorPosition, maxOffset));
                    range.setEnd(textNode, Math.min(cursorPosition, maxOffset));
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
        }
        checkEmpty();
    }, [checkEmpty]);

    const handleSubmit = useCallback(() => {
        if (isDisabled || !inputRef.current) return;

        const promptText = inputRef.current.innerText;
        if (promptText && promptText.length > 0) {
            onSubmit(promptText);
            inputRef.current.textContent = '';
            setTimeout(checkEmpty);
        }
    }, [isDisabled, onSubmit, checkEmpty]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLParagraphElement>) => {
            checkEmpty();
            if (e.code === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isDisabled) {
                    handleSubmit();
                }
            }
        },
        [checkEmpty, handleSubmit, isDisabled]
    );

    // Autofocus
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
        checkEmpty();
    }, [checkEmpty]);

    return (
        <div
            className={classNames(
                'mb-5 mx-5 flex min-h-10 max-w-[50rem] self-center',
                'relative bg-white rounded-2xl',
                'border border-slate-300/80 focus-within:ring-2 ring-yellow-200/80 chatInput'
            )}
        >
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
                disabled={chatStatus !== ChatSessionStatus.Active}
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
                disabled={isDisabled}
                onClick={handleSubmit}
                className={classNames(
                    'h-[1.875rem] self-end mb-1 mr-[5px] w-[1.875rem] transition-all',
                    'rounded-xl flex-shrink-0 flex items-center justify-center',
                    'relative hintTarget',
                    {
                        'bg-blue-600 cursor-pointer hover:bg-blue-700 active:bg-blue-800 active:scale-90': !isDisabled,
                        'bg-gray-400 cursor-not-allowed': isDisabled,
                    }
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
