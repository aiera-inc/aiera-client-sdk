import React from 'react';
import { match } from 'ts-pattern';
import { Message } from '..';
import { MicroQuestionMark } from '@aiera/client-sdk/components/Svg/MicroQuestionMark';

export const MessagePrompt = ({ data }: { data: Message }) => {
    return (
        <div>
            <p className="text-base leading-[14px] font-bold antialiased">{data.prompt}</p>
        </div>
    );
};

const ItemContent = ({ data }: { data: Message }) => {
    return (
        <div style={{ paddingBottom: '2rem' }}>
            <div className="text-base leading-[14px]">{data.text}</div>
        </div>
    );
};

export function MessageFactory({ data }: { data: Message }) {
    return match(data.type)
        .with('prompt', () => <MessagePrompt data={data} />)
        .otherwise(() => <ItemContent data={data} />);
}
