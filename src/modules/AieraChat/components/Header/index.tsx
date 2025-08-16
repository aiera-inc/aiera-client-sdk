import { MicroBars } from '@aiera/client-sdk/components/Svg/MicroBars';
import React from 'react';
import { Title } from './Title';
import { IconButton } from '../IconButton';
import { useChatStore } from '../../store';
import { MicroPlusCircle } from '@aiera/client-sdk/components/Svg/MicroPlusCircle';

export function Header({
    onChangeTitle,
    onOpenMenu,
}: {
    onChangeTitle: (title: string) => void;
    onOpenMenu: () => void;
}) {
    const { onNewChat } = useChatStore();
    return (
        <div className="flex items-center justify-between mx-4 py-4">
            <IconButton hintText="All Chats" className="mr-2.5" Icon={MicroBars} onClick={onOpenMenu} />
            <Title onChangeTitle={onChangeTitle} />
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
