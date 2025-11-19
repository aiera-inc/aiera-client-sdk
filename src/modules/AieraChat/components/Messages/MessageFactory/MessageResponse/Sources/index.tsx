import { Chevron } from '@aiera/client-sdk/components/Svg/Chevron';
import { MicroBank } from '@aiera/client-sdk/components/Svg/MicroBank';
import { MicroCalendar } from '@aiera/client-sdk/components/Svg/MicroCalendar';
import { MicroFolder } from '@aiera/client-sdk/components/Svg/MicroFolder';
import { MicroFolderOpen } from '@aiera/client-sdk/components/Svg/MicroFolderOpen';
import { MicroArrowUpRight } from '@aiera/client-sdk/components/Svg/MicroArrowUpRight';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { useMessageBus } from '@aiera/client-sdk/lib/msg';
import { Source, useChatStore } from '@aiera/client-sdk/modules/AieraChat/store';
import { CurrentUserQuery } from '@aiera/client-sdk/types';
import classNames from 'classnames';
import React, { useState } from 'react';
import { match } from 'ts-pattern';
import { format, parseISO } from 'date-fns';
import { useQuery } from '@aiera/client-sdk/api/client';
import { gql } from 'urql';
import { Citation as CitationType } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block';
import { Citation as CitationComponent } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Citation';
import { MicroPaperclip } from '@aiera/client-sdk/components/Svg/MicroPaperclip';
import { Hint } from '../../../../Hint';

const formatDate = (dateString?: string) => {
    if (dateString) {
        return `• ${format(parseISO(dateString), 'MMM d, yyyy')}`;
    } else return dateString;
};

const POP_OUT_SOURCE_TYPES = ['attachment', 'filing'];

interface NavSource extends Source {
    sourceParentId?: string;
}

interface SourcesProps {
    sources: Source[];
    citations?: CitationType[];
}

export const Sources = ({ sources, citations }: SourcesProps) => {
    const [expanded, setExpanded] = useState(false);
    const { onSelectSource, getCitationMarker } = useChatStore();
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

    // Function to find matching citation for a source
    const findMatchingCitation = (source: Source): CitationType | null => {
        if (!citations || citations.length === 0) return null;

        // Find citation where citation's sourceParentId or sourceId matches source's targetId
        const matchingCitation = citations.find((citation) => {
            const citationId = citation.sourceParentId || citation.sourceId;
            return citationId === source.targetId;
        });

        return matchingCitation || null;
    };

    // Group sources by type, then sort by whether they have citations
    const groupedSources = (() => {
        const groups: Record<string, Source[]> = {};

        sources.forEach((source) => {
            if (!source.title) return;

            const type = match(source.targetType)
                .with('transcript', () => 'Transcript')
                .with('filing', () => 'Filing')
                .with('event', () => 'Event')
                .with('attachment', () => 'Event Attachment')
                .with('external', () => 'External Link')
                .otherwise(() => source.targetType.charAt(0).toUpperCase() + source.targetType.slice(1));

            if (!groups[type]) {
                groups[type] = [];
            }
            const group = groups[type];
            if (group) {
                group.push(source);
            }
        });

        // Sort sources within each group: cited sources first, then by citation number
        Object.keys(groups).forEach((type) => {
            const group = groups[type];
            if (group) {
                group.sort((a, b) => {
                    const aCitation = findMatchingCitation(a);
                    const bCitation = findMatchingCitation(b);
                    const aHasCitation = !!aCitation;
                    const bHasCitation = !!bCitation;

                    // First sort: cited sources before non-cited
                    if (aHasCitation && !bHasCitation) return -1;
                    if (!aHasCitation && bHasCitation) return 1;

                    // Second sort: if both have citations, sort by marker number
                    if (aHasCitation && bHasCitation && aCitation && bCitation) {
                        const aMarker = getCitationMarker(aCitation);
                        const bMarker = getCitationMarker(bCitation);
                        if (aMarker && bMarker) {
                            // Extract the numeric part (e.g., "1" from "E1" or "T1.2")
                            const aNum = parseInt(aMarker.match(/\d+/)?.[0] ?? '0');
                            const bNum = parseInt(bMarker.match(/\d+/)?.[0] ?? '0');
                            return aNum - bNum;
                        }
                    }

                    return 0;
                });
            }
        });

        return groups;
    })();

    const sourcesSummary = (() => {
        const counts = sources.reduce((acc, source) => {
            const type = match(source.targetType)
                .with('transcript', () => 'Transcript')
                .with('filing', () => 'Filing')
                .with('event', () => 'Event')
                .with('attachment', () => 'Event Attachment')
                .with('external', () => 'External Link')
                .otherwise(() => source.targetType.charAt(0).toUpperCase() + source.targetType.slice(1));
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts)
            .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
            .join(', ');
    })();

    if (sources.length === 0) {
        return null;
    }

    return (
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
                Object.entries(groupedSources).map(([type, groupSources]) => (
                    <div key={type}>
                        <div className="px-3 pt-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {groupSources.length > 1 ? `${type}s` : type}
                        </div>
                        {groupSources.map((source, idx) => {
                            const matchingCitation = findMatchingCitation(source);
                            const globalMarker = matchingCitation ? getCitationMarker(matchingCitation) : null;
                            // Extract base marker without sub-numbering (e.g., "T1" from "T1.2")
                            const baseMarker = globalMarker ? globalMarker.split('.')[0] : null;
                            return (
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
                                        .with('external', () => <MicroArrowUpRight className="w-4 text-slate-600" />)
                                        .with('attachment', () => <MicroPaperclip className="w-4 text-slate-600" />)
                                        .otherwise(() => null)}
                                    <p className="text-base flex-1 line-clamp-1 ml-2 text-left">
                                        {source.title} {formatDate(source.date)}
                                    </p>
                                    {matchingCitation && baseMarker ? (
                                        <div className="pointer-events-none">
                                            <CitationComponent citation={{ ...matchingCitation, marker: baseMarker }} />
                                        </div>
                                    ) : (
                                        <span className="hintTarget relative text-xs text-slate-500 ml-2 border-b border-dashed border-slate-400">
                                            <Hint
                                                yOffset={0}
                                                maxWidth={200}
                                                text="The model was aware of this source, but did not generate any citations from it."
                                                targetHeight={26}
                                                targetWidth={100}
                                                anchor={'top-right'}
                                                grow={'up-right'}
                                            />
                                            Source Considered
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
        </div>
    );
};
