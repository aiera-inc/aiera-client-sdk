import { MicroQuestionMark } from '@aiera/client-sdk/components/Svg/MicroQuestionMark';
import classNames from 'classnames';
import React from 'react';
import { ChatMessagePrompt } from '../../../../services/messages';
import { useChatStore } from '../../../../store';

export const MessagePrompt = ({
    data,
    className,
    isStickyHeader,
}: {
    data: ChatMessagePrompt;
    className?: string;
    isStickyHeader?: boolean;
}) => {
    const { searchTerm } = useChatStore();
    const prompt = data.prompt;
    if (!prompt) return null;
    return (
        <div
            className={classNames(
                'px-4 bg-slate-200/60-solid rounded-xl flex relative',
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
                    className={classNames('text-base font-bold antialiased leading-[1.125rem]', {
                        'line-clamp-2': isStickyHeader,
                    })}
                >
                    {searchTerm
                        ? prompt
                              .split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
                              .map((part, index) =>
                                  part.toLowerCase() === searchTerm.toLowerCase() ? (
                                      <mark key={index} className="bg-yellow-400">
                                          {part}
                                      </mark>
                                  ) : (
                                      part
                                  )
                              )
                        : prompt}
                </p>
            </div>
        </div>
    );
};
