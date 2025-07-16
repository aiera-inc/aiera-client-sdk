import debounce from 'lodash.debounce';
import React, { useCallback, useEffect } from 'react';
import { useChatStore } from '../../../store';

export function Title({ onChangeTitle }: { onChangeTitle: (title: string) => void }) {
    const { chatTitle, onSetTitle } = useChatStore();

    // Debounce calling the mutation with each change
    const debouncedTitleChange = useCallback(
        debounce((title: string) => {
            onChangeTitle(title);
        }, 300),
        [onChangeTitle]
    );

    // Cleanup the debounced function on component unmount
    useEffect(() => {
        return () => {
            debouncedTitleChange.cancel();
        };
    }, [debouncedTitleChange]);

    return (
        <div className="flex-1 flex items-center text-base font-bold">
            <input
                aria-label="Chat title"
                className="text-center antialiased flex-1 outline-none bg-transparent truncate"
                onChange={(e) => {
                    const title = e.target.value;
                    onSetTitle(title);
                    debouncedTitleChange(title);
                }}
                placeholder="Untitled Chat"
                value={chatTitle ?? ''}
            />
        </div>
    );
}
