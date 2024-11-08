import React from 'react';
import { match } from 'ts-pattern';
import { Message } from '..';
import { MicroQuestionMark } from '../../../../components/Svg/MicroQuestionMark';
import classNames from 'classnames';

export const MessagePrompt = ({
    data,
    className,
    isStickyHeader,
}: {
    data: Message;
    className?: string;
    isStickyHeader?: boolean;
}) => {
    return (
        <div
            className={classNames(
                'px-4 bg-[#ECF0F3] rounded-xl flex relative',
                {
                    'py-3.5 min-h-14': !isStickyHeader,
                    'h-14': isStickyHeader,
                },
                className
            )}
        >
            <div
                className={classNames(
                    'h-7 self-start flex-shrink-0 w-7 mr-2.5 bg-indigo-600',
                    'flex items-center justify-center rounded-lg',
                    {
                        'mt-3.5': isStickyHeader,
                    }
                )}
            >
                <MicroQuestionMark className="w-4 text-white" />
            </div>
            <div className="self-center">
                <p
                    className={classNames('text-base font-bold antialiased leading-4', {
                        'line-clamp-2': isStickyHeader,
                    })}
                >
                    {data.prompt}
                </p>
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
