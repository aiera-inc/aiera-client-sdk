import debounce from 'lodash.debounce';
import React, { useCallback, useEffect } from 'react';
import { useChatStore } from '../../../store';
import { useConfig } from '@aiera/client-sdk/lib/config';
import classNames from 'classnames';

export function Title({ onChangeTitle }: { onChangeTitle: (title: string) => void }) {
    const { chatTitle, onSetTitle } = useChatStore();
    const config = useConfig();

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
        <div
            className={classNames('flex-1 flex items-center font-bold', {
                'text-base': !config.options?.isMobile,
                'text-lg': config.options?.isMobile,
            })}
        >
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
