import { Button } from '@aiera/client-sdk/components/Button';
import { LoadingSpinner } from '@aiera/client-sdk/components/LoadingSpinner';
import { MicroBars } from '@aiera/client-sdk/components/Svg/MicroBars';
import { MicroTrash } from '@aiera/client-sdk/components/Svg/MicroTrash';
import classNames from 'classnames';
import React, { useState } from 'react';
import { Panel } from '../Panel';
import { PanelSearchInput } from '../PanelSearchInput';
import { useChatSessions } from '../services/chats';
import { useChatStore } from '../store';
import { PanelContentRow } from '../PanelContentRow';

export function Menu({ onClose, onOpenConfirm }: { onOpenConfirm: () => void; onClose: () => void }) {
    const { chatId, onSelectChat, onNewChat } = useChatStore();
    const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);
    const { sessions, isLoading } = useChatSessions();

    const filteredResults = sessions.filter(({ title }) =>
        title.toLowerCase().includes(searchTerm?.toLowerCase() || '')
    );
    return (
        <Panel Icon={MicroBars} className="mt-4 flex flex-col flex-1" onClose={onClose} title="Chat Menu" side="left">
            {({ onStartExit }) => (
                <div className="flex flex-col flex-1 pb-6">
                    <PanelSearchInput
                        onChange={setSearchTerm}
                        value={searchTerm}
                        name="search_chats"
                        placeholder="Search..."
                        className="mx-5"
                    />
                    <div className="flex-1 flex flex-col relative">
                        <div className="absolute inset-0 overflow-y-auto py-4 flex flex-col flex-1">
                            {!isLoading &&
                                filteredResults.map(({ id, title }) => (
                                    <PanelContentRow
                                        text={title}
                                        key={id}
                                        onClick={() => {
                                            onSelectChat(id, title);
                                            onStartExit();
                                        }}
                                        onClickIcon={() => {
                                            onOpenConfirm();
                                        }}
                                        Icon={MicroTrash}
                                        iconClassName="text-slate-500 hover:text-rose-600"
                                        className={classNames({
                                            'bg-slate-200/50': chatId === id,
                                        })}
                                    />
                                ))}
                            {filteredResults.length === 0 && searchTerm && !isLoading && (
                                <div className="text-slate-600 py-1 flex items-center justify-center mx-5">
                                    <p className="text-sm text-center text-balance">
                                        No results found for <span className="font-bold antialiased">{searchTerm}</span>
                                    </p>
                                </div>
                            )}
                            {isLoading && (
                                <div className="mt-6 flex items-center justify-center">
                                    <LoadingSpinner heightClass="h-6" widthClass="w-6" />
                                </div>
                            )}
                        </div>
                    </div>
                    <Button
                        className="mx-5"
                        kind="primary"
                        onClick={() => {
                            onNewChat();
                            onStartExit();
                        }}
                    >
                        <p className="text-center flex-1">Start New Chat</p>
                    </Button>
                </div>
            )}
        </Panel>
    );
}
