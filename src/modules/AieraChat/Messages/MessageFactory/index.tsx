import { MicroCopy } from '@aiera/client-sdk/components/Svg/MicroCopy';
import { MicroQuestionMark } from '@aiera/client-sdk/components/Svg/MicroQuestionMark';
import { MicroRefresh } from '@aiera/client-sdk/components/Svg/MicroRefresh';
import { MicroSparkles } from '@aiera/client-sdk/components/Svg/MicroSparkles';
import { MicroThumbDown } from '@aiera/client-sdk/components/Svg/MicroThumbDown';
import { MicroThumbUp } from '@aiera/client-sdk/components/Svg/MicroThumbUp';
import { VirtuosoMessageListProps } from '@virtuoso.dev/message-list';
import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { match } from 'ts-pattern';
import { MessageListContext } from '..';
import { Message } from '../../services/messages';
import { useChatStore, Source } from '../../store';
import { IconButton } from '../../IconButton';
import { MicroCheck } from '@aiera/client-sdk/components/Svg/MicroCheck';
import { Button } from '@aiera/client-sdk/components/Button';
import { MicroTrash } from '@aiera/client-sdk/components/Svg/MicroTrash';
import { AddSourceDialog } from '../../AddSourceDialog';

export const MessagePrompt = ({
    data,
    className,
    isStickyHeader,
}: {
    data: Message;
    className?: string;
    isStickyHeader?: boolean;
}) => {
    const { searchTerm } = useChatStore();
    const prompt = data.prompt;
    if (!prompt) return null;
    return (
        <div
            className={classNames(
                'px-4 bg-slate-200/60-solid rounded-xl flex relative',
                {
                    'py-3.5 min-h-14': !isStickyHeader,
                    'h-14': isStickyHeader,
                },
                className
            )}
        >
            <div
                className={classNames(
                    'h-7 self-start flex-shrink-0 w-7 mr-2.5 bg-indigo-600',
                    'flex items-center justify-center rounded-lg',
                    {
                        'mt-3.5': isStickyHeader,
                    }
                )}
            >
                <MicroQuestionMark className="w-4 text-white" />
            </div>
            <div className="self-center">
                <p
                    className={classNames('text-base font-bold antialiased leading-4', {
                        'line-clamp-2': isStickyHeader,
                    })}
                >
                    {searchTerm
                        ? prompt
                              .split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
                              .map((part, index) =>
                                  part.toLowerCase() === searchTerm.toLowerCase() ? (
                                      <mark key={index} className="bg-yellow-400">
                                          {part}
                                      </mark>
                                  ) : (
                                      part
                                  )
                              )
                        : prompt}
                </p>
            </div>
        </div>
    );
};

type MessageFeedback = 'pos' | 'neg' | undefined;

const ItemContent = ({ data, onReRun }: { onReRun: (k: string) => void; data: Message }) => {
    const { onSelectSource, searchTerm } = useChatStore();
    const [copied, setCopied] = useState(false);
    // TODO getMessage from network / cache for managing feedback
    const [feedback, setFeedback] = useState<MessageFeedback>(undefined);

    const onHandleCopy = useCallback(() => {
        setCopied(true);
        // TODO - hook up real copy

        // We want to let them copy again
        setTimeout(() => {
            setCopied(false);
        }, 5000);
    }, []);

    return data.status === 'thinking' ? (
        <div className="flex items-center py-4 justify-center text-sm">
            <MicroSparkles className="w-4 mr-1.5 animate-bounce text-yellow-400" />
            <p className="font-semibold antialiased">Thinking...</p>
        </div>
    ) : (
        <div className="pb-10 flex flex-col">
            <div className="pt-4 pl-4 pb-4 pr-2 text-base">
                {searchTerm
                    ? data.text
                          .split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
                          .map((part, index) =>
                              part.toLowerCase() === searchTerm.toLowerCase() ? (
                                  <mark key={index} className="bg-yellow-400">
                                      {part}
                                  </mark>
                              ) : (
                                  part
                              )
                          )
                    : data.text}
                <span
                    onClick={() =>
                        onSelectSource({
                            targetId: '2639849',
                            targetType: 'event',
                            title: 'TSLA Q3 2024 Earnings Call',
                        })
                    }
                    className={classNames(
                        'text-xs px-[3px] cursor-pointer hover:bg-indigo-800 ml-1 py-0.5 font-bold antialiased text-white bg-indigo-600 rounded',
                        {
                            'opacity-0': data.status !== 'finished',
                        }
                    )}
                >
                    C1
                </span>
            </div>
            {data.status === 'finished' && (
                <div className="flex items-center pl-4 pr-2">
                    <IconButton
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
                    <IconButton
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
                    <IconButton
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
                    <div className="flex-1" />
                    <IconButton
                        hintText="Re-run Response"
                        hintAnchor="bottom-right"
                        hintGrow="down-left"
                        Icon={MicroRefresh}
                        onClick={() => onReRun(data.key)}
                    />
                </div>
            )}
        </div>
    );
};

const SourcesResponse = ({ data, onConfirm }: { onConfirm: (k: string) => void; data: Message }) => {
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
            targetId: '2639849',
            targetType: 'event',
        },
        {
            title: 'Apple Inc Q3 2024 Earnings Call',
            targetId: '2639849',
            targetType: 'event',
        },
        {
            title: 'Tesla Q2 2024 Earnings Call',
            targetId: '2639849',
            targetType: 'event',
        },
    ]);

    const onRemoveSource = useCallback(
        (index: number) => {
            const newSources = [...localSources];
            newSources.splice(index, 1);
            setLocalSources(newSources);
        },
        [localSources]
    );

    return data.status === 'thinking' ? (
        <div className="flex items-center py-4 justify-center text-sm">
            <MicroSparkles className="w-4 mr-1.5 animate-bounce text-yellow-400" />
            <p className="font-semibold antialiased">Finding sources...</p>
        </div>
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
                    {data.status !== 'confirmed' && (
                        <div
                            className="ml-4 text-slate-600 hover:text-red-600"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onRemoveSource(idx);
                            }}
                        >
                            <MicroTrash className="w-4" />
                        </div>
                    )}
                </div>
            ))}
            {data.status === 'finished' && localSources.length > 0 && (
                <div className="flex items-center justify-center px-3 mt-3 pb-5 text-sm">
                    <Button
                        kind="primary"
                        className="px-5"
                        onClick={() => {
                            onConfirm(data.key);
                            onAddSource(localSources);
                        }}
                    >
                        Confirm Sources
                    </Button>
                    <Button className="ml-2 px-4" kind="default" onClick={() => setShowSourceDialog(true)}>
                        Add Source
                    </Button>
                </div>
            )}
            {data.status === 'finished' && localSources.length === 0 && (
                <div className="flex items-center justify-center pb-5 text-sm">
                    <Button kind="primary" onClick={() => setShowSourceDialog(true)}>
                        Add Sources
                    </Button>
                </div>
            )}
            {showSourceDialog && <AddSourceDialog onClose={() => setShowSourceDialog(false)} />}
        </div>
    );
};

export const MessageFactory: VirtuosoMessageListProps<Message, MessageListContext>['ItemContent'] = ({
    data,
    context,
}) => {
    return match(data.type)
        .with('prompt', () => <MessagePrompt data={data} />)
        .with('sources', () => <SourcesResponse data={data} onConfirm={context.onConfirm} />)
        .otherwise(() => <ItemContent data={data} onReRun={context.onReRun} />);
};
