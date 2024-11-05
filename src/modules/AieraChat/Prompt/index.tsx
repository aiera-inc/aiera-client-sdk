import { MicroArrowUp } from '@aiera/client-sdk/components/Svg/MicroArrowUp';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';

export function Prompt() {
    const [isEmpty, setIsEmpty] = useState(true);
    const inputRef = useRef<HTMLParagraphElement | null>(null);

    const checkEmpty = () => {
        if (inputRef.current) {
            const content = inputRef.current.textContent || '';
            setIsEmpty(content.trim() === '');
        }
    };

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
                onInput={checkEmpty}
                onBlur={checkEmpty}
                contentEditable
            />

            {isEmpty && (
                <span className="absolute left-4 top-2 z-10 text-base text-slate-500 pointer-events-none">
                    Type your questions here...
                </span>
            )}
            <button
                className={classNames(
                    'h-[1.875rem] ml-2 self-end mb-1 mr-[5px] w-[1.875rem] transition-all',
                    'bg-blue-600 rounded-xl flex-shrink-0 flex items-center justify-center',
                    'cursor-pointer hover:bg-blue-700 active:bg-blue-800 active:scale-90'
                )}
            >
                <MicroArrowUp className="w-4 text-white" />
            </button>
        </div>
    );
}
