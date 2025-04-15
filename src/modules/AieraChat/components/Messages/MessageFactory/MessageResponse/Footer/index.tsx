import { MicroCheck } from '@aiera/client-sdk/components/Svg/MicroCheck';
import { MicroCopy } from '@aiera/client-sdk/components/Svg/MicroCopy';
import { MicroFolder } from '@aiera/client-sdk/components/Svg/MicroFolder';
import { MicroRefresh } from '@aiera/client-sdk/components/Svg/MicroRefresh';
import { MicroThumbDown } from '@aiera/client-sdk/components/Svg/MicroThumbDown';
import { MicroThumbUp } from '@aiera/client-sdk/components/Svg/MicroThumbUp';
import { AddSourceDialog } from '@aiera/client-sdk/modules/AieraChat/modals/AddSourceDialog';
import { IconButton } from '@aiera/client-sdk/modules/AieraChat/components/IconButton';
import { ChatMessage } from '@aiera/client-sdk/modules/AieraChat/services/messages';
import { Source } from '@aiera/client-sdk/modules/AieraChat/store';
import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { FeedbackDialog } from '@aiera/client-sdk/modules/AieraChat/modals/FeedbackDialog';
import { MicroChatLeftRight } from '@aiera/client-sdk/components/Svg/MicroChatLeftRight';

type MessageFeedback = 'pos' | 'neg' | undefined;

export const Footer = ({
    data,
    onCopy,
    onReRun,
    showCopy = true,
    showEditSources = false,
    showRetry = false,
    showVoting = true,
}: {
    onCopy?: () => void;
    onReRun: (k: string) => void;
    data: ChatMessage;
    showCopy?: boolean;
    showEditSources?: boolean;
    showRetry?: boolean;
    showVoting?: boolean;
}) => {
    const [copied, setCopied] = useState(false);
    // TODO getMessage from network / cache for managing feedback
    const [feedback, setFeedback] = useState<MessageFeedback>(undefined);
    const [showFeedback, setShowFeedback] = useState(false);
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

    const onHandleCopy = useCallback(() => {
        setCopied(true);

        if (onCopy) {
            onCopy();
        }

        // We want to let them copy again
        setTimeout(() => {
            setCopied(false);
        }, 5000);
    }, [onCopy]);

    return (
        <>
            <div className="flex items-center px-3">
                {showCopy && (
                    <IconButton
                        hintAnchor="top-left"
                        hintText={copied ? 'Copied!' : 'Copy to Clipboard'}
                        onClick={onHandleCopy}
                        textClass={classNames({
                            'text-indigo-600': copied,
                        })}
                        bgClass={classNames({
                            'bg-indigo-600/10 hover:bg-indigo-600/20 active:bg-indigo-600/30': copied,
                        })}
                        className="mr-2"
                        Icon={copied ? MicroCheck : MicroCopy}
                    />
                )}
                {showVoting && (
                    <IconButton
                        hintAnchor="top-left"
                        hintText="Good Response"
                        onClick={() => setFeedback((pv) => (pv === 'pos' ? undefined : 'pos'))}
                        className={classNames('mr-2')}
                        textClass={classNames({
                            'text-green-600': feedback === 'pos',
                        })}
                        bgClass={classNames({
                            'bg-green-600/10 hover:bg-green-600/20 active:bg-green-600/30': feedback === 'pos',
                        })}
                        Icon={MicroThumbUp}
                    />
                )}
                {showVoting && (
                    <IconButton
                        hintAnchor="top-left"
                        hintText="Poor Response"
                        textClass={classNames({
                            'text-red-600': feedback === 'neg',
                        })}
                        bgClass={classNames({
                            'bg-red-600/10 hover:bg-red-600/20 active:bg-red-600/30': feedback === 'neg',
                        })}
                        onClick={() => setFeedback((pv) => (pv === 'neg' ? undefined : 'neg'))}
                        Icon={MicroThumbDown}
                    />
                )}
                <div className="flex-1" />
                <IconButton
                    className="ml-2"
                    hintText="Submit Feedback"
                    hintAnchor="top-right"
                    hintGrow="up-left"
                    Icon={MicroChatLeftRight}
                    onClick={() => setShowFeedback(true)}
                >
                    Feedback
                </IconButton>
                {showEditSources && (
                    <IconButton
                        className="ml-2"
                        hintText="Edit Sources"
                        hintAnchor="top-right"
                        hintGrow="up-left"
                        Icon={MicroFolder}
                        onClick={() => setShowSourceDialog(true)}
                    >
                        {localSources.length || ''}
                    </IconButton>
                )}
                {showRetry && (
                    <IconButton
                        className="ml-2"
                        hintText="Retry Response"
                        hintAnchor="top-right"
                        hintGrow="up-left"
                        Icon={MicroRefresh}
                        onClick={() => onReRun(data.id)}
                    />
                )}
            </div>
            {showSourceDialog && (
                <AddSourceDialog
                    onAddSource={onAddLocalSource}
                    onRemoveSource={onRemoveSource}
                    onClose={() => setShowSourceDialog(false)}
                    sources={localSources}
                />
            )}
            {showFeedback && (
                <FeedbackDialog messageId={data.id} prompt={data.prompt} onClose={() => setShowFeedback(false)} />
            )}
        </>
    );
};
