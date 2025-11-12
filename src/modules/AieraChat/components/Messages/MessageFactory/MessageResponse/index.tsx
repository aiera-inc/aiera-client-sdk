import { Chevron } from '@aiera/client-sdk/components/Svg/Chevron';
import { MicroBank } from '@aiera/client-sdk/components/Svg/MicroBank';
import { MicroCalendar } from '@aiera/client-sdk/components/Svg/MicroCalendar';
import { MicroFolder } from '@aiera/client-sdk/components/Svg/MicroFolder';
import { MicroFolderOpen } from '@aiera/client-sdk/components/Svg/MicroFolderOpen';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { useMessageBus } from '@aiera/client-sdk/lib/msg';
import { copyToClipboard, log } from '@aiera/client-sdk/lib/utils';
import { Source, useChatStore } from '@aiera/client-sdk/modules/AieraChat/store';
import { ChatSessionStatus, CurrentUserQuery } from '@aiera/client-sdk/types';
import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { match } from 'ts-pattern';
import { ChatMessageResponse } from '../../../../services/messages';
import { Block } from '../Block';
import { Footer } from './Footer';
import { useQuery } from '@aiera/client-sdk/api/client';
import { gql } from 'urql';
import { format, parseISO } from 'date-fns';

const formatDate = (dateString?: string) => {
    if (dateString) {
        return `• ${format(parseISO(dateString), 'MMM d, yyyy')}`;
    } else return dateString;
};

const POP_OUT_SOURCE_TYPES = ['attachment', 'filing'];

interface NavSource extends Source {
    sourceParentId?: string;
}

export const MessageResponse = ({
    data,
    isLastItem,
}: {
    data: ChatMessageResponse;
    isLastItem: boolean;
    generatingResponse: boolean;
}) => {
    const [expanded, setExpanded] = useState(false);
    const { chatStatus, onSelectSource } = useChatStore();
    const userQuery = useQuery<CurrentUserQuery>({
        requestPolicy: 'cache-only',
        query: gql`
            query CurrentUserQuery {
                currentUser {
                    id
                    apiKey
                }
            }
        `,
    });

    const userApiKey = userQuery.state.data?.currentUser?.apiKey;
    const config = useConfig();
    const bus = useMessageBus();
    const onNav = (source: NavSource) => {
        if (config.options?.aieraChatDisableSourceNav) {
            bus?.emit('chat-source', source, 'out');
        } else if (
            POP_OUT_SOURCE_TYPES.includes(source.targetType) &&
            source.targetId &&
            config.restApiUrl &&
            config.restApiUrl !== 'undefined' &&
            userApiKey
        ) {
            const url = `${config.restApiUrl}/content/${source.targetId}/pdf?api_key=${userApiKey}`;
            window.open(url, '_blank', 'noopener,noreferrer');
        } else if (source.url) {
            window.open(source.url, '_blank', 'noopener,noreferrer');
        } else if (source.targetType !== 'external') {
            onSelectSource(source);
        }
    };

    const sourcesSummary = (() => {
        const counts = data.sources.reduce((acc, source) => {
            const type = match(source.targetType)
                .with('transcript', () => 'Transcript')
                .with('filing', () => 'Filing')
                .with('event', () => 'Event')
                .with('attachment', () => 'Event Attachment')
                .otherwise(() => source.targetType.charAt(0).toUpperCase() + source.targetType.slice(1));
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts)
            .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
            .join(', ');
    })();

    const handleCopy = useCallback(() => {
        if (!data.blocks || data.blocks.length === 0) return;

        // Process all blocks
        const contentParts = data.blocks.map((block) => block.content).filter((part) => part.trim() !== '');
        const fullContent = contentParts.join('\n\n');

        if (fullContent) {
            copyToClipboard(fullContent)
                .then(() => {
                    log('Full message content copied successfully');
                })
                .catch((error: Error) => {
                    log(`Failed to copy content: ${error.message}`, 'error');
                });
        }
    }, [data]);

    return (
        <div className="flex flex-col pb-6 mx-4">
            <div className="flex flex-col px-2">
                {data.blocks?.map((block, index) => (
                    <Block {...block} key={index} />
                ))}
            </div>
            {data.sources.length > 0 && (
                <div
                    className={classNames(
                        'flex flex-col overflow-hidden border border-slate-300/80 rounded-lg ml-1 mr-10 mb-3 message-sources',
                        {
                            'pb-1': expanded,
                        }
                    )}
                >
                    <button
                        onClick={() => setExpanded((pv) => !pv)}
                        className={classNames(
                            'py-2.5 hover:bg-slate-100 antialiased flex pl-3 pr-4 items-center justify-between message-sources-header',
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
                        <p className="text-base text-left ml-2 font-bold">Sources Used</p>
                        <p className="text-base flex-1 text-left ml-2 text-slate-600">{sourcesSummary}</p>
                        <Chevron
                            className={classNames('w-2 transition-all text-slate-600', {
                                'rotate-180': expanded,
                            })}
                        />
                    </button>
                    {expanded &&
                        data.sources.map((source, idx) => (
                            <div
                                key={`${idx}-${source.targetId}`}
                                className={classNames(
                                    'mx-1 mt-1 text-sm px-2 py-1.5',
                                    'hover:bg-slate-200/40 rounded-md',
                                    'cursor-pointer flex items-center'
                                )}
                                onClick={() => onNav(source)}
                            >
                                {match(source.targetType)
                                    .with('event', () => <MicroCalendar className="w-4 text-slate-600" />)
                                    .with('transcript', () => <MicroCalendar className="w-4 text-slate-600" />)
                                    .with('filing', () => <MicroBank className="w-4 text-slate-600" />)
                                    .otherwise(() => null)}
                                <p className="text-base flex-1 line-clamp-1 ml-2 text-left">
                                    {source.title} {formatDate(source.date)}
                                </p>
                            </div>
                        ))}
                </div>
            )}
            {(chatStatus === ChatSessionStatus.Active || !isLastItem) && <Footer data={data} onCopy={handleCopy} />}
        </div>
    );
};
