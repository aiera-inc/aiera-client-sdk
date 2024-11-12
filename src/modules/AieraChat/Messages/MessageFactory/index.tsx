import classNames from 'classnames';
import React from 'react';
import { match } from 'ts-pattern';
import { Message } from '..';
import { MicroCopy } from '../../../../components/Svg/MicroCopy';
import { MicroQuestionMark } from '../../../../components/Svg/MicroQuestionMark';
import { MicroRefresh } from '../../../../components/Svg/MicroRefresh';
import { MicroSparkles } from '../../../../components/Svg/MicroSparkles';
import { MicroThumbDown } from '../../../../components/Svg/MicroThumbDown';
import { MicroThumbUp } from '../../../../components/Svg/MicroThumbUp';
import { IconButton } from '../../Header/IconButton';
import { useSourcesStore } from '../../store';

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
                'px-4 bg-slate-200 rounded-xl flex relative',
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
    const { onSelectSource } = useSourcesStore();
    return data.status === 'thinking' ? (
        <div className="flex items-center py-4 justify-center text-sm">
            <MicroSparkles className="w-4 mr-1.5 animate-bounce text-yellow-400" />
            <p className="font-semibold antialiased">Thinking...</p>
        </div>
    ) : (
        <div className="pb-8 flex flex-col">
            <div className="pt-4 pl-4 pb-4 pr-2 text-base">
                {data.text}
                <span
                    onClick={() =>
                        onSelectSource({
                            targetId: '2639849',
                            targetType: 'event',
                            title: 'TSLA Q3 2024 Earnings Call',
                        })
                    }
                    className={classNames(
                        'text-xs px-[3px] cursor-pointer hover:bg-indigo-800 ml-1 py-0.5 font-bold antialiased text-white bg-indigo-600 rounded',
                        {
                            'opacity-0': data.status !== 'finished',
                        }
                    )}
                >
                    C1
                </span>
            </div>
            {data.status === 'finished' && (
                <div className="flex items-center pl-4 pr-2">
                    <IconButton className="mr-2" Icon={MicroRefresh} />
                    <IconButton className="mr-2" Icon={MicroCopy} />
                    <div className="flex-1" />
                    <IconButton className="mr-2" Icon={MicroThumbUp} />
                    <IconButton Icon={MicroThumbDown} />
                </div>
            )}
        </div>
    );
};

export function MessageFactory({ data }: { data: Message }) {
    return match(data.type)
        .with('prompt', () => <MessagePrompt data={data} />)
        .otherwise(() => <ItemContent data={data} />);
}
