import { Citation as CitationType } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block';
import React from 'react';
import { useChatStore } from '../../../../store';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { useMessageBus } from '@aiera/client-sdk/lib/msg';

interface CitationProps {
    citation: CitationType;
}

export const Citation = ({ citation }: CitationProps) => {
    const { onSelectSource } = useChatStore();
    const config = useConfig();
    const { contentId, marker, source, sourceId, sourceParentId } = citation;
    const bus = useMessageBus();

    const onNav = () => {
        if (config.options?.aieraChatDisableSourceNav) {
            bus?.emit('chat-citation', citation, 'out');
        } else {
            onSelectSource({
                contentId,
                targetId: sourceParentId || sourceId,
                targetType: 'event',
                title: source,
            });
        }
    };

    return (
        <span className="citation relative inline-flex items-center h-3.5 ml-0.5">
            <span
                onClick={onNav}
                className="flex h-3.5 items-center leading-[10px] rounded bg-blue-700 px-[3px] py-px text-xs font-bold tracking-tight text-white antialiased cursor-pointer hover:bg-yellow-500 hover:text-black"
            >
                {marker}
            </span>
        </span>
    );
};
