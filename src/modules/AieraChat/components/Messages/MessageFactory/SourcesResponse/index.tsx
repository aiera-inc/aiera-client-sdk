import { Button } from '@aiera/client-sdk/components/Button';
import { Chevron } from '@aiera/client-sdk/components/Svg/Chevron';
import { MicroCheck } from '@aiera/client-sdk/components/Svg/MicroCheck';
import { MicroFolder } from '@aiera/client-sdk/components/Svg/MicroFolder';
import { MicroFolderOpen } from '@aiera/client-sdk/components/Svg/MicroFolderOpen';
import { MicroTrash } from '@aiera/client-sdk/components/Svg/MicroTrash';
import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import { AddSourceDialog } from '../../../../modals/AddSourceDialog';
import { ChatMessageSources, ChatMessageStatus } from '../../../../services/messages';
import { Source, useChatStore } from '../../../../store';
import { useMessageBus } from '@aiera/client-sdk/lib/msg';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { match } from 'ts-pattern';
import { MicroCalendar } from '@aiera/client-sdk/components/Svg/MicroCalendar';
import { MicroBank } from '@aiera/client-sdk/components/Svg/MicroBank';
import { useUserPreferencesStore } from '@aiera/client-sdk/modules/AieraChat/userPreferencesStore';

export const SourcesResponse = ({
    data,
    onConfirm,
}: {
    onConfirm: (messageId: string, sources: Source[]) => void;
    data: ChatMessageSources;
}) => {
    const { onSelectSource } = useChatStore();
    const { sourceConfirmations } = useUserPreferencesStore();
    const [isConfirming, setIsConfirming] = useState<boolean>(false);
    const [showSourceDialog, setShowSourceDialog] = useState<boolean>(false);
    const [localSources, setLocalSources] = useState<Source[]>(data.sources);
    const [expanded, setExpanded] = useState(sourceConfirmations === 'manual' && !data.confirmed);

    const onAddSource = useCallback(
        (s: Source) => {
            setLocalSources((pv) => [...pv, s]);
        },
        [setLocalSources]
    );

    const onRemoveSource = useCallback(
        (s: Source) => {
            setLocalSources((pv) =>
                pv.filter((source) => !(source.targetId === s.targetId && source.targetType === s.targetType))
            );
        },
        [setLocalSources]
    );

    const config = useConfig();
    const bus = useMessageBus();

    const onNav = ({ targetType, targetId, title }: { targetType: string; title: string; targetId: string }) => {
        if (config.options?.aieraChatDisableSourceNav) {
            bus?.emit('chat-source', { targetId, targetType }, 'out');
        } else {
            onSelectSource({
                targetId,
                targetType,
                title,
            });
        }
    };

    useEffect(() => {
        setLocalSources(data.sources);
    }, [data.sources, setLocalSources]);

    const isLoading = data.status === ChatMessageStatus.PENDING || data.status === ChatMessageStatus.QUEUED;
    const isComplete = !isLoading && data.status !== ChatMessageStatus.STREAMING;

    return (
        <div
            className={classNames(
                'flex flex-col overflow-hidden border border-slate-300/80 rounded-lg mx-4 mb-2 message-sources',
                {
                    'pb-1': expanded,
                }
            )}
        >
            <button
                onClick={() => setExpanded((pv) => !pv)}
                className={classNames(
                    'py-2.5 hover:bg-slate-100 flex pl-3 pr-4 items-center justify-between message-sources-header',
                    {
                        'border-b': expanded,
                    }
                )}
            >
                {expanded ? (
                    <MicroFolderOpen className="w-4 text-slate-600" />
                ) : (
                    <MicroFolder className="w-4 text-slate-600" />
                )}
                <p className="text-base flex-1 text-left ml-2">{`${localSources.length} Sources Selected`}</p>
                <Chevron
                    className={classNames('w-2 transition-all text-slate-600', {
                        'rotate-180': expanded,
                    })}
                />
            </button>
            {expanded &&
                localSources.map(({ title, targetId, targetType }, idx) => (
                    <div
                        key={`${idx}-${targetId}`}
                        className={classNames(
                            'mx-1 mt-1 text-sm px-2 py-1.5',
                            'hover:bg-slate-200/40 rounded-md',
                            'cursor-pointer flex items-center'
                        )}
                        onClick={() => onNav({ targetId, targetType, title })}
                    >
                        {match(targetType)
                            .with('event', () => <MicroCalendar className="w-4 text-slate-600" />)
                            .with('transcript', () => <MicroCalendar className="w-4 text-slate-600" />)
                            .with('filing', () => <MicroBank className="w-4 text-slate-600" />)
                            .otherwise(() => null)}
                        <p className="text-base flex-1 line-clamp-1 ml-2 text-left">{title}</p>
                        <div
                            className={classNames('ml-4', {
                                'text-slate-600 hover:text-red-600': !data.confirmed,
                                'text-green-600': data.confirmed,
                            })}
                            onClick={
                                data.confirmed
                                    ? undefined
                                    : (e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          onRemoveSource({ targetId, targetType, title });
                                      }
                            }
                        >
                            {data.confirmed ? <MicroCheck className="w-4" /> : <MicroTrash className="w-4" />}
                        </div>
                    </div>
                ))}
            {isComplete && localSources.length >= 0 && !data.confirmed && (
                <div className="flex items-center px-3 pb-2 pt-1 text-sm">
                    {localSources.length > 0 && (
                        <Button
                            className="px-5"
                            disabled={isConfirming}
                            kind="primary"
                            onClick={() => {
                                if (data.promptMessageId) {
                                    setIsConfirming(true);
                                    setExpanded(false);
                                    onConfirm(data.promptMessageId, localSources);
                                }
                            }}
                        >
                            <MicroCheck className="w-4 mr-1.5 -ml-2" />
                            Confirm Sources
                        </Button>
                    )}
                    <Button className="ml-2 px-4" kind="default" onClick={() => setShowSourceDialog(true)}>
                        Add Source
                    </Button>
                </div>
            )}
            {showSourceDialog && (
                <AddSourceDialog
                    onAddSource={onAddSource}
                    onRemoveSource={onRemoveSource}
                    onClose={() => setShowSourceDialog(false)}
                    sources={localSources}
                />
            )}
        </div>
    );
};
