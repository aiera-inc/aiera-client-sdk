import React, { Fragment } from 'react';
import { useChatStore } from '../../../../store';
import { Citation as CitationType } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block';

interface CitationProps {
    citation: CitationType;
}

export const Citation = ({ citation }: CitationProps) => {
    const { citations, onSelectSource } = useChatStore();
    const { contentId, source, sourceId } = citation;
    const citationIndex = (citations || []).findIndex((s) => s.contentId === contentId);
    const number = citationIndex >= 0 ? citationIndex + 1 : null;
    return number !== null ? (
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
                C{number}
            </span>
        </Fragment>
    ) : null;
};
