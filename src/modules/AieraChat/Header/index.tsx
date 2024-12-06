import { MicroBars } from '@aiera/client-sdk/components/Svg/MicroBars';
import React, { RefObject } from 'react';
import { Search } from './Search';
import { VirtuosoMessageListMethods } from '@virtuoso.dev/message-list';
import { IconButton } from '../IconButton';
import { ChatMessage } from '../services/messages';

export function Header({
    onOpenMenu,
    virtuosoRef,
}: {
    virtuosoRef: RefObject<VirtuosoMessageListMethods<ChatMessage>>;
    onOpenMenu: () => void;
}) {
    return (
        <div className="flex items-center justify-between mx-4 mt-4">
            <IconButton hintText="All Chats" className="mr-2.5" Icon={MicroBars} onClick={onOpenMenu} />
            <Search virtuosoRef={virtuosoRef} />
        </div>
    );
}
