import React from 'react';
import { match } from 'ts-pattern';
import { Message } from '..';
import { MicroQuestionMark } from '@aiera/client-sdk/components/Svg/MicroQuestionMark';

export const MessagePrompt = ({ data }: { data: Message }) => {
    return (
        <div className="px-4 py-3.5 bg-[#ECF0F3] rounded-xl flex items-center z-10 relative">
            <div className="h-7 flex-shrink-0 w-7 mr-2.5 bg-indigo-600 flex items-center justify-center rounded-lg">
                <MicroQuestionMark className="w-4 text-white" />
            </div>
            <div>
                <p className="text-base font-bold antialiased leading-4">{data.prompt}</p>
            </div>
        </div>
    );
};

const ItemContent = ({ data }: { data: Message }) => {
    return (
        <div style={{ paddingBottom: '2rem', display: 'flex' }}>
            <div className="p-4 text-base">{data.text}</div>
        </div>
    );
};

export function MessageFactory({ data }: { data: Message }) {
    return match(data.type)
        .with('prompt', () => <MessagePrompt data={data} />)
        .otherwise(() => <ItemContent data={data} />);
}
