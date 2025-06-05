import classNames from 'classnames';
import React, { Fragment } from 'react';
import { useChatStore } from '../../../../store';
import { SearchableText } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/SearchableText';

export interface CitationProps {
    author?: string;
    contentId?: string;
    date?: string;
    marker: string;
    meta?: object;
    source: string;
    sourceId: string;
    text: string;
    url?: string;
}

export const Citation = ({ contentId, source, sourceId, text }: CitationProps) => {
    const { citations, onSelectSource } = useChatStore();
    const citationIndex = (citations || []).findIndex((s) => s.contentId === contentId);
    const number = citationIndex >= 0 ? citationIndex + 1 : null;
    return (
        <Fragment>
            <SearchableText text={text} />
            {number !== null && (
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
                        className={classNames(
                            'text-xs px-[3px] cursor-pointer hover:bg-indigo-800 py-0.5 font-bold antialiased text-white bg-indigo-600 rounded',
                            'mr-1'
                        )}
                    >
                        C{number}
                    </span>
                </Fragment>
            )}
        </Fragment>
    );
};
