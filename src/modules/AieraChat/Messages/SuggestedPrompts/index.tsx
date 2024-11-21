import React, { useCallback, useState } from 'react';
import { VirtuosoMessageListProps } from '@virtuoso.dev/message-list';
import { Message } from '../../services/messages';
import { useSuggestedPrompts } from '../../services/suggestedPrompts';
import { LoadingSpinner } from '@aiera/client-sdk/components/LoadingSpinner';
import { Chevron } from '@aiera/client-sdk/components/Svg/Chevron';
import { MessageListContext } from '..';

export const SuggestedPrompts: VirtuosoMessageListProps<Message, MessageListContext>['EmptyPlaceholder'] = ({
    context,
}: {
    context: MessageListContext;
}) => {
    const { prompts, isLoading } = useSuggestedPrompts();
    const [page, setPage] = useState(0);

    const onNextPage = useCallback(() => {
        if (page + 1 < prompts.length - 1) {
            setPage((pv) => pv + 1);
        } else {
            setPage(0);
        }
    }, [prompts, page]);

    const onPrevPage = useCallback(() => {
        if (page - 1 >= 0) {
            setPage((pv) => pv - 1);
        } else {
            setPage(prompts.length - 1);
        }
    }, [prompts, page]);

    const suggestedPrompt = prompts[page];

    return (
        <div className="flex-1 flex flex-col justify-end h-full pb-4 mx-2">
            {isLoading ? (
                <div className="flex items-center justify-center py-2">
                    <LoadingSpinner heightClass="h-6" widthClass="w-6" />
                </div>
            ) : (
                suggestedPrompt && (
                    <>
                        <div className="flex items-center justify-between mb-2">
                            <p className="ml-3 text-sm font-semibold">Suggested Questions</p>
                        </div>
                        <div
                            onClick={() => {
                                context.onSubmit(suggestedPrompt.prompt);
                            }}
                            key={suggestedPrompt.id}
                            className="cursor-pointer hover:text-blue-600 border border-slate-200 rounded-lg px-2.5 py-1.5"
                        >
                            <p className="text-base italic">{suggestedPrompt.prompt}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center ml-1.5">
                                <div className="px-2 cursor-pointer hover:text-blue-600" onClick={onPrevPage}>
                                    <Chevron className="w-2 rotate-90" />
                                </div>
                                <div className="px-2 cursor-pointer hover:text-blue-600" onClick={onNextPage}>
                                    <Chevron className="w-2 -rotate-90" />
                                </div>
                            </div>
                            <p className="mr-2 text-sm text-slate-500">{`${page + 1} / ${prompts.length}`}</p>
                        </div>
                    </>
                )
            )}
        </div>
    );
};
