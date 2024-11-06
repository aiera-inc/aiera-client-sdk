import { MicroBars } from '@aiera/client-sdk/components/Svg/MicroBars';
import { MicroGear } from '@aiera/client-sdk/components/Svg/MicroGear';
import { MicroStack } from '@aiera/client-sdk/components/Svg/MicroStack';
import React from 'react';
import { IconButton } from './IconButton';
import { Search } from './Search';

export function Header({
    title,
    onOpenMenu,
    onOpenSettings,
    onOpenSources,
}: {
    title?: string;
    onOpenMenu: () => void;
    onOpenSettings: () => void;
    onOpenSources: () => void;
}) {
    return (
        <div className="flex items-center justify-between mx-4 mt-4">
            <IconButton Icon={MicroBars} onClick={onOpenMenu} />
            <Search title={title} />
            <IconButton className="mx-2.5" onClick={onOpenSources} Icon={MicroStack} />
            <IconButton onClick={onOpenSettings} Icon={MicroGear} />
        </div>
    );
}
