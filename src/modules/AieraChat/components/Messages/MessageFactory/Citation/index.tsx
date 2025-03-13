import classNames from 'classnames';
import React, { Fragment } from 'react';
import { useChatStore } from '../../../../store';
import { SearchableText } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/SearchableText';
import { Citation as CitationType } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Block';

interface CitationProps {
    citation: CitationType;
    number: number;
}

export const Citation = ({ citation, number }: CitationProps) => {
    const { onSelectSource } = useChatStore();
    const { id, source, text } = citation;
    return (
        <Fragment>
            <SearchableText text={text} />
            &nbsp;
            <span
                onClick={() =>
                    onSelectSource({
                        targetId: id,
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
    );
};
