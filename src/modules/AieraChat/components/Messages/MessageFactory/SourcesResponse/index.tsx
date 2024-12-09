import { Button } from '@aiera/client-sdk/components/Button';
import { MicroTrash } from '@aiera/client-sdk/components/Svg/MicroTrash';
import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { AddSourceDialog } from '../../../../modals/AddSourceDialog';
import { ChatMessageSources, ChatMessageStatus } from '../../../../services/messages';
import { Source, useChatStore } from '../../../../store';
import { Loading } from '../Loading';

export const SourcesResponse = ({ data, onConfirm }: { onConfirm: (k: string) => void; data: ChatMessageSources }) => {
    const { onSelectSource, onAddSource } = useChatStore();
    const [showSourceDialog, setShowSourceDialog] = useState(false);
    const [localSources, setLocalSources] = useState<Source[]>([
        {
            title: 'Tesla Q3 2024 Earnings Call',
            targetId: '2639849',
            targetType: 'event',
        },
        {
            title: 'Meta Platforms Q2 2024 Earnings Call',
            targetId: '2658051',
            targetType: 'event',
        },
        {
            title: 'Apple Inc Q3 2024 Earnings Call',
            targetId: '2656780',
            targetType: 'event',
        },
        {
            title: 'Tesla Q2 2024 Earnings Call',
            targetId: '2613061',
            targetType: 'event',
        },
    ]);

    const onAddLocalSource = useCallback((s: Source) => {
        setLocalSources((pv) => [...pv, s]);
    }, []);

    const onRemoveSource = useCallback((s: Source) => {
        setLocalSources((pv) =>
            pv.filter((source) => !(source.targetId === s.targetId && source.targetType === s.targetType))
        );
    }, []);

    if (data.confirmed) {
        return <div />;
    }

    const isLoading = data.status === ChatMessageStatus.PENDING || data.status === ChatMessageStatus.QUEUED;
    const isComplete = !isLoading && data.status !== ChatMessageStatus.STREAMING;

    return isLoading ? (
        <Loading>Finding Sources...</Loading>
    ) : (
        <div className="flex flex-col pt-4">
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
                    {!data.confirmed && (
                        <div
                            className="ml-4 text-slate-600 hover:text-red-600"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onRemoveSource({ targetId, targetType: 'event', title });
                            }}
                        >
                            <MicroTrash className="w-4" />
                        </div>
                    )}
                </div>
            ))}
            {isComplete && localSources.length > 0 && (
                <div className="flex items-center justify-center px-3 mt-3 pb-5 text-sm">
                    <Button className="mr-2 px-4" kind="default" onClick={() => setShowSourceDialog(true)}>
                        Add Source
                    </Button>
                    <Button
                        kind="primary"
                        className="px-5"
                        onClick={() => {
                            onConfirm(data.ordinalId);
                            onAddSource(localSources);
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
                    onAddSource={onAddLocalSource}
                    onRemoveSource={onRemoveSource}
                    onClose={() => setShowSourceDialog(false)}
                    sources={localSources}
                />
            )}
        </div>
    );
};
