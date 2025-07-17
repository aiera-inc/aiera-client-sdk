import { MicroQuestionMark } from '@aiera/client-sdk/components/Svg/MicroQuestionMark';
import classNames from 'classnames';
import React from 'react';
import { ChatMessagePrompt } from '../../../../services/messages';

export const MessagePrompt = ({ data, className }: { data: ChatMessagePrompt; className?: string }) => {
    const prompt = data.prompt;
    if (!prompt) return null;
    return (
        <div className="sticky top-0 z-30">
            <div
                className={classNames('px-4 bg-slate-200/60-solid rounded-xl flex relative py-3.5 min-h-14', className)}
            >
                <div className="h-7 self-start flex-shrink-0 w-7 mr-2.5 bg-indigo-600 flex items-center justify-center rounded-lg">
                    <MicroQuestionMark className="w-4 text-white" />
                </div>
                <div className="self-center">
                    <p className="text-base font-bold antialiased leading-[1.125rem]">{prompt}</p>
                </div>
            </div>
        </div>
    );
};
