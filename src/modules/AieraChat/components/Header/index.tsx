import { MicroBars } from '@aiera/client-sdk/components/Svg/MicroBars';
import React, { RefObject } from 'react';
import { Search } from './Search';
import { VirtuosoMessageListMethods } from '@virtuoso.dev/message-list';
import { IconButton } from '../IconButton';
import { ChatMessage } from '../../services/messages';
import { useChatStore } from '../../store';
import { MicroPlusCircle } from '@aiera/client-sdk/components/Svg/MicroPlusCircle';

export function Header({
    onChangeTitle,
    onOpenMenu,
    virtuosoRef,
}: {
    onChangeTitle: (title: string) => void;
    onOpenMenu: () => void;
    virtuosoRef: RefObject<VirtuosoMessageListMethods<ChatMessage>>;
}) {
    const { onNewChat } = useChatStore();
    return (
        <div className="flex items-center justify-between mx-4 mt-4">
            <IconButton hintText="All Chats" className="mr-2.5" Icon={MicroBars} onClick={onOpenMenu} />
            <Search onChangeTitle={onChangeTitle} virtuosoRef={virtuosoRef} />
            <IconButton
                hintAnchor="bottom-right"
                hintGrow="down-left"
                hintText="New Chat"
                className="ml-2.5 hover:brightness-95"
                Icon={MicroPlusCircle}
                textClass="text-blue-600"
                bgClass="bg-blue-100"
                onClick={onNewChat}
            />
        </div>
    );
}
