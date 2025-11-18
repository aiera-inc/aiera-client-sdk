import { useConfig } from '@aiera/client-sdk/lib/config';
import { useMessageBus } from '@aiera/client-sdk/lib/msg';
import { Citation as CitationType } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block';
import React from 'react';
import { useChatStore } from '../../../../store';
import { Hint } from '../../../Hint';
import { useQuery } from '@aiera/client-sdk/api/client';
import { CurrentUserQuery } from '@aiera/client-sdk/types';
import { gql } from 'urql';
import { match } from 'ts-pattern';
import { MicroCalendar } from '@aiera/client-sdk/components/Svg/MicroCalendar';
import { MicroBank } from '@aiera/client-sdk/components/Svg/MicroBank';
import { MicroArrowUpRight } from '@aiera/client-sdk/components/Svg/MicroArrowUpRight';
import { MicroPaperclip } from '@aiera/client-sdk/components/Svg/MicroPaperclip';

const POP_OUT_SOURCE_TYPES = ['attachment', 'filing'];
const SELECTABLE_SOURCE_TYPES = ['event', 'transcript'];

interface CitationProps {
    citation: CitationType;
}

function extractDomain(urlString: string) {
    const url = new URL(urlString);
    const parts = url.hostname.replace(/^www\./, '').split('.');

    // For domains like "example.com", return "example.com"
    // For subdomains like "blog.example.com", return "example.com"
    return parts.length > 1 ? parts.slice(-2).join('.') : parts[0];
}

export const Citation = ({ citation }: CitationProps) => {
    const { onSelectSource } = useChatStore();
    const config = useConfig();
    const { contentId, marker, source, sourceId, sourceParentId, sourceType, url } = citation;
    const bus = useMessageBus();
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
    const onNav = () => {
        if (config.options?.aieraChatDisableSourceNav) {
            bus?.emit('chat-citation', citation, 'out');
        } else if (
            POP_OUT_SOURCE_TYPES.includes(sourceType) &&
            userApiKey &&
            config.restApiUrl &&
            config.restApiUrl !== 'undefined'
        ) {
            const url = `${config.restApiUrl}/content/${sourceId}/pdf?api_key=${userApiKey}`;
            window.open(url, '_blank', 'noopener,noreferrer');
        } else if (SELECTABLE_SOURCE_TYPES.includes(sourceType)) {
            onSelectSource({
                contentId,
                targetId: sourceParentId || sourceId,
                targetType: 'event',
                title: source,
            });
        } else if (url) {
            // If the citation has a url defined, just open it
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <span className="citation hintTarget relative inline-flex items-center h-3.5 ml-0.5">
            <Hint
                maxWidth={200}
                text={citation.source || 'N/A'}
                targetHeight={14}
                targetWidth={25}
                anchor={'top-left'}
                grow={'up-right'}
            />
            <span
                onClick={onNav}
                className="flex h-3.5 items-center gap-0.5 leading-[10px] rounded bg-blue-700 px-[3px] py-px text-xs font-bold tracking-tight text-white antialiased cursor-pointer hover:bg-yellow-500 hover:text-black"
            >
                {match(citation.sourceType)
                    .with('event', () => <MicroCalendar className="w-3" />)
                    .with('transcript', () => <MicroCalendar className="w-3" />)
                    .with('attachment', () => <MicroPaperclip className="w-3" />)
                    .with('filing', () => <MicroBank className="w-3" />)
                    .with('external', () => <MicroArrowUpRight className="w-3" />)
                    .otherwise(() => null)}
                {citation.sourceType === 'external' && citation.url ? extractDomain(citation.url) : marker.slice(1)}
            </span>
        </span>
    );
};
