import { MicroChatLeftRight } from '@aiera/client-sdk/components/Svg/MicroChatLeftRight';
import { MicroCheck } from '@aiera/client-sdk/components/Svg/MicroCheck';
import { MicroClipboard } from '@aiera/client-sdk/components/Svg/MicroClipboard';
import { MicroThumbDown } from '@aiera/client-sdk/components/Svg/MicroThumbDown';
import { MicroThumbUp } from '@aiera/client-sdk/components/Svg/MicroThumbUp';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { IconButton } from '@aiera/client-sdk/modules/AieraChat/components/IconButton';
import { FeedbackDialog } from '@aiera/client-sdk/modules/AieraChat/modals/FeedbackDialog';
import { ChatMessage } from '@aiera/client-sdk/modules/AieraChat/services/messages';
import classNames from 'classnames';
import React, { useCallback, useState } from 'react';

type MessageFeedback = 'pos' | 'neg' | undefined;

export const Footer = ({
    data,
    onCopy,
    showCopy = true,
    showVoting = true,
}: {
    onCopy?: () => void;
    data: ChatMessage;
    showCopy?: boolean;
    showVoting?: boolean;
}) => {
    const config = useConfig();
    const [copied, setCopied] = useState(false);
    // TODO getMessage from network / cache for managing feedback
    const [feedback, setFeedback] = useState<MessageFeedback>(undefined);
    const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

    console.log({ data });
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
            <div className="flex items-center justify-start">
                {showCopy && (
                    <IconButton
                        hintAnchor="top-left"
                        hintText={copied ? 'Copied!' : 'Copy to Clipboard'}
                        onClick={onHandleCopy}
                        textClass={classNames({
                            'text-indigo-600': copied,
                        })}
                        bgClass={classNames({
                            'hover:bg-indigo-600/20 active:bg-indigo-600/30': copied,
                            'bg-transparent hover:bg-slate-200/60-solid': !copied,
                        })}
                        Icon={copied ? MicroCheck : MicroClipboard}
                    />
                )}
                {showVoting && (
                    <IconButton
                        hintAnchor="top-left"
                        hintText="Good Response"
                        onClick={() => setFeedback((pv) => (pv === 'pos' ? undefined : 'pos'))}
                        textClass={classNames({
                            'text-green-600': feedback === 'pos',
                        })}
                        bgClass={classNames({
                            'bg-green-600/10 hover:bg-green-600/20 active:bg-green-600/30': feedback === 'pos',
                            'bg-transparent hover:bg-slate-200/60-solid': feedback !== 'pos',
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
                            'bg-transparent hover:bg-slate-200/60-solid': feedback !== 'neg',
                        })}
                        onClick={() => setFeedback((pv) => (pv === 'neg' ? undefined : 'neg'))}
                        Icon={MicroThumbDown}
                    />
                )}
                {config.options?.aieraChatCollectInternalFeedback &&
                    config.options.aieraChatCollectInternalFeedback === true && (
                        <IconButton
                            hintText="Submit Feedback"
                            hintAnchor="top-left"
                            iconClassName="ml-0.5"
                            hintGrow="up-right"
                            bgClass="bg-transparent hover:bg-slate-200/60-solid"
                            Icon={MicroChatLeftRight}
                            onClick={() => setShowFeedbackDialog(true)}
                        />
                    )}
                <p className="text-sm ml-3 text-slate-500">Aiera can make mistakes. Please double-check responses.</p>
            </div>
            {showFeedbackDialog && (
                <FeedbackDialog messageId={data.id} prompt={data.prompt} onClose={() => setShowFeedbackDialog(false)} />
            )}
        </>
    );
};
