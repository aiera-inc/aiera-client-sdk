import { Citation as CitationType } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block';
import React from 'react';
import { useChatStore } from '../../../../store';

interface CitationProps {
    citation: CitationType;
}

export const Citation = ({ citation }: CitationProps) => {
    const { onSelectSource } = useChatStore();
    const { contentId, marker, source, sourceId } = citation;
    return (
        <span className="relative inline-block h-3.5 mr-1.5">
            <span
                onClick={() =>
                    onSelectSource({
                        contentId,
                        targetId: sourceId,
                        targetType: 'event',
                        title: source,
                    })
                }
                className="absolute flex h-3.5 items-center leading-[10px] rounded bg-blue-700 px-[3px] py-px text-xs font-bold tracking-tight text-white antialiased cursor-pointer hover:bg-yellow-500 hover:text-black"
            >
                {marker.slice(1, -1).replace(/^./, (char) => char.toUpperCase())}
            </span>
            <span className="invisible flex items-center px-[3px] text-xs font-bold tracking-tight antialiased">
                {marker.slice(1, -1).replace(/^./, (char) => char.toUpperCase())}
            </span>
        </span>
    );
};
