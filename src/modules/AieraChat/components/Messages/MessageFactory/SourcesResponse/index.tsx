import { Button } from '@aiera/client-sdk/components/Button';
import { MicroTrash } from '@aiera/client-sdk/components/Svg/MicroTrash';
import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import { AddSourceDialog } from '../../../../modals/AddSourceDialog';
import { ChatMessageSources, ChatMessageStatus } from '../../../../services/messages';
import { Source, useChatStore } from '../../../../store';
import { Loading } from '../Loading';
import { MessageWrapper } from '../MessageWrapper';
import { MicroCheck } from '@aiera/client-sdk/components/Svg/MicroCheck';

export const SourcesResponse = ({
    data,
    onConfirm,
}: {
    onConfirm: (messageId: string, sources: Source[]) => void;
    data: ChatMessageSources;
}) => {
    const { onSelectSource } = useChatStore();
    const [isConfirming, setIsConfirming] = useState<boolean>(false);
    const [showSourceDialog, setShowSourceDialog] = useState<boolean>(false);
    const [localSources, setLocalSources] = useState<Source[]>(data.sources);

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

    useEffect(() => {
        setLocalSources(data.sources);
    }, [data.sources, setLocalSources]);

    const isLoading = data.status === ChatMessageStatus.PENDING || data.status === ChatMessageStatus.QUEUED;
    const isComplete = !isLoading && data.status !== ChatMessageStatus.STREAMING;

    return (
        <MessageWrapper>
            {isLoading ? (
                <Loading>Finding Sources...</Loading>
            ) : (
                <div className="flex flex-col">
                    <p className="text-base font-bold antialiased mx-3 mb-1">Suggested Sources</p>
                    {localSources.map(({ title, targetId }, idx) => (
                        <div
                            key={`${idx}-${targetId}`}
                            className={classNames(
                                'mx-3 mt-1 text-sm px-3 py-1.5 rounded-lg border border-slate-300/60',
                                'hover:bg-slate-200/40',
                                'cursor-pointer flex items-center justify-between'
                            )}
                            onClick={() =>
                                onSelectSource({
                                    targetId,
                                    targetType: 'event',
                                    title,
                                })
                            }
                        >
                            <p className="text-base line-clamp-1">{title}</p>
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
                                              onRemoveSource({ targetId, targetType: 'event', title });
                                          }
                                }
                            >
                                {data.confirmed ? <MicroCheck className="w-4" /> : <MicroTrash className="w-4" />}
                            </div>
                        </div>
                    ))}
                    {isComplete && localSources.length > 0 && !data.confirmed && (
                        <div className="flex items-center justify-center px-3 mt-4 pb-5 text-sm">
                            <Button className="mr-2 px-4" kind="default" onClick={() => setShowSourceDialog(true)}>
                                Add Source
                            </Button>
                            <Button
                                className="px-5"
                                disabled={isConfirming}
                                kind="primary"
                                onClick={() => {
                                    if (data.promptMessageId) {
                                        setIsConfirming(true);
                                        onConfirm(data.promptMessageId, localSources);
                                    }
                                }}
                            >
                                Confirm Sources
                            </Button>
                        </div>
                    )}
                    {isComplete && localSources.length === 0 && (
                        <div className="flex items-center justify-center pb-5 text-sm">
                            <Button kind="primary" className="px-5" onClick={() => setShowSourceDialog(true)}>
                                Add Sources
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
            )}
        </MessageWrapper>
    );
};
