import classNames from 'classnames';
import React from 'react';
import { useChatStore } from '../../../store';

export const Citation = () => {
    const { onSelectSource } = useChatStore();

    return (
        <span
            onClick={() =>
                onSelectSource({
                    targetId: '2639849',
                    targetType: 'event',
                    title: 'TSLA Q3 2024 Earnings Call',
                })
            }
            className={classNames(
                'text-xs px-[3px] cursor-pointer hover:bg-indigo-800 ml-1 py-0.5 font-bold antialiased text-white bg-indigo-600 rounded'
            )}
        >
            C1
        </span>
    );
};
