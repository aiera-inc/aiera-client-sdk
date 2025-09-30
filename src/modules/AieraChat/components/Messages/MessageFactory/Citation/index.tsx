import { useConfig } from '@aiera/client-sdk/lib/config';
import { useMessageBus } from '@aiera/client-sdk/lib/msg';
import { Citation as CitationType } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block';
import React from 'react';
import { useChatStore } from '../../../../store';
import { Hint } from '../../../Hint';

const POP_OUT_SOURCE_TYPES = ['attachment', 'filing'];
const SELECTABLE_SOURCE_TYPES = ['event', 'transcript'];

interface CitationProps {
    citation: CitationType;
}

export const Citation = ({ citation }: CitationProps) => {
    const { onSelectSource } = useChatStore();
    const config = useConfig();
    const { contentId, marker, source, sourceId, sourceParentId, sourceType, url } = citation;
    const bus = useMessageBus();

    const onNav = () => {
        if (config.options?.aieraChatDisableSourceNav) {
            bus?.emit('chat-citation', citation, 'out');
        } else if (url) {
            // If the citation has a url defined, just open it
            window.open(url, '_blank', 'noopener,noreferrer');
        } else if (POP_OUT_SOURCE_TYPES.includes(sourceType) && config.restApiUrl) {
            // We currently don't have a way to distinguish between slides and press releases,
            // so for now, default to the /press_url endpoint
            // TODO: check `meta` property on the citation to distinguish between the two types
            if (sourceType === 'attachment' && sourceParentId) {
                const attachmentUrl = `${config.restApiUrl}/events/${sourceParentId}/assets/press_url`;
                window.open(attachmentUrl, '_blank', 'noopener,noreferrer');
            }
            if (sourceType === 'filing' && sourceId) {
                const filingUrl = `${config.restApiUrl}/filings-v1/${sourceId}/pdf`;
                window.open(filingUrl, '_blank', 'noopener,noreferrer');
            }
        } else if (SELECTABLE_SOURCE_TYPES.includes(sourceType)) {
            onSelectSource({
                contentId,
                targetId: sourceParentId || sourceId,
                targetType: 'event',
                title: source,
            });
        }
    };

    return (
        <span className="citation hintTarget relative inline-flex items-center h-3.5 ml-0.5">
            <Hint text={citation.source} targetHeight={14} targetWidth={25} anchor={'top-left'} grow={'up-right'} />
            <span
                onClick={onNav}
                className="flex h-3.5 items-center leading-[10px] rounded bg-blue-700 px-[3px] py-px text-xs font-bold tracking-tight text-white antialiased cursor-pointer hover:bg-yellow-500 hover:text-black"
            >
                {marker}
            </span>
        </span>
    );
};
