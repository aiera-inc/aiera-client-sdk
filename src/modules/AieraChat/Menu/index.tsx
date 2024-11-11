import React from 'react';
import { Panel } from '../Panel';
import { MicroBars } from '@aiera/client-sdk/components/Svg/MicroBars';
import classNames from 'classnames';
import { Button } from '@aiera/client-sdk/components/Button';
import { MicroTrash } from '@aiera/client-sdk/components/Svg/MicroTrash';

const data = [
    {
        id: '1',
        title: 'My New Chat',
    },
    {
        id: '2',
        title: '2024 Tech Trends',
    },
    {
        id: '3',
        title: 'Talking About Guidance and stuff...',
    },
    {
        id: '4',
        title: 'Supply Chain Disruptions and stuff',
    },
];

export function Menu({
    onClose,
    currentChatId,
    onOpenConfirm,
}: {
    onOpenConfirm: () => void;
    onClose: () => void;
    currentChatId: string;
}) {
    return (
        <Panel
            Icon={MicroBars}
            className="px-5 mt-4 flex flex-col flex-1"
            onClose={onClose}
            title="Chat Menu"
            side="left"
        >
            <div className="flex flex-col flex-1 pb-4">
                <input
                    type="text"
                    name="search_chats"
                    className="text-sm border border-slate-200 focus:outline focus:border-transparent outline-2 outline-blue-700 rounded-full h-8 px-3 mb-4"
                    placeholder="Search..."
                />
                {data.map(({ id, title }) => (
                    <div
                        key={id}
                        className={classNames(
                            'cursor-pointer flex hover:bg-slate-200/80 hover:text-blue-700',
                            'pl-2.5 ml-0.5 pr-1.5 mr-1.5 rounded-lg',
                            'justify-between items-center py-1 text-slate-600',
                            {
                                'bg-slate-200/50': currentChatId === id,
                            }
                        )}
                    >
                        <p className="text-sm line-clamp-1">{title}</p>
                        <div
                            className="ml-2 text-slate-500 hover:text-rose-600"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onOpenConfirm();
                            }}
                        >
                            <MicroTrash className="w-4" />
                        </div>
                    </div>
                ))}
                <div className="flex-1" />
                <Button kind="primary">
                    <p className="text-center flex-1">Start New Chat</p>
                </Button>
            </div>
        </Panel>
    );
}
