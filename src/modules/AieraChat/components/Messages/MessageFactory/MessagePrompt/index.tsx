import classNames from 'classnames';
import { format, parseISO } from 'date-fns';
import React from 'react';
import { ChatMessagePrompt } from '../../../../services/messages';

export const MessagePrompt = ({
    data,
    className,
    isStickyHeader,
}: {
    data: ChatMessagePrompt;
    className?: string;
    isStickyHeader?: boolean;
}) => {
    const prompt = data.prompt;
    if (!prompt) return null;
    return (
        <div className={classNames('pt-5 pb-2 group/prompt flex relative justify-end', className)}>
            <p className="text-sm absolute top-0 right-4 text-slate-600 opacity-0 group-hover/prompt:opacity-100">
                {format(parseISO(data.timestamp), 'h:mm a')}
            </p>
            <div className="self-center px-4 py-3 bg-slate-200/40 rounded-xl">
                <p
                    className={classNames('text-base font-medium antialiased leading-[1.125rem]', {
                        'line-clamp-2': isStickyHeader,
                    })}
                >
                    {prompt}
                </p>
            </div>
        </div>
    );
};
