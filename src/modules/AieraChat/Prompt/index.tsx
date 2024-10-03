import { MicroArrowUp } from '@aiera/client-sdk/components/Svg/MicroArrowUp';
import classNames from 'classnames';
import React, { useEffect, useRef } from 'react';

export function Prompt() {
    const inputRef = useRef<HTMLParagraphElement | null>(null);

    // Autofocus
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div className="mb-5 mx-5 flex min-h-10 bg-white rounded-2xl border border-slate-300/80 focus-within:ring-2 ring-yellow-200/80 chatInput">
            <p
                ref={inputRef}
                className="flex-1 py-2 pl-4 text-base outline-none chatPrompt"
                placeholder="Type your questions here..."
                contentEditable
            />
            <button
                className={classNames(
                    'h-[1.875rem] self-end mb-1 mr-[5px] w-[1.875rem] transition-all',
                    'bg-blue-600 rounded-xl flex items-center justify-center',
                    'cursor-pointer hover:bg-blue-700 active:bg-blue-800 active:scale-90'
                )}
            >
                <MicroArrowUp className="w-4 text-white" />
            </button>
        </div>
    );
}
