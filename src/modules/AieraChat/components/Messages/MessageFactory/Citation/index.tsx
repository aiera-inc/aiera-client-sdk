import React, { Fragment } from 'react';
import { useChatStore } from '../../../../store';
import { Citation as CitationType } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block';

interface CitationProps {
    citation: CitationType;
}

export const Citation = ({ citation }: CitationProps) => {
    const { onSelectSource } = useChatStore();
    const { contentId, marker, source, sourceId } = citation;
    return (
        <Fragment>
            &nbsp;
            <span
                onClick={() =>
                    onSelectSource({
                        contentId,
                        targetId: sourceId,
                        targetType: 'event',
                        title: source,
                    })
                }
                className="text-xs px-[3px] cursor-pointer hover:bg-indigo-800 py-0.5 font-bold antialiased text-white bg-indigo-600 rounded"
            >
                {marker.slice(1, -1).replace(/^./, (char) => char.toUpperCase())}
            </span>
        </Fragment>
    );
};
