import { MicroBars } from '@aiera/client-sdk/components/Svg/MicroBars';
import React from 'react';
import { IconButton } from './IconButton';
import { Search } from './Search';

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
    return (
        <div className="flex items-center justify-between mx-4 mt-4">
            <IconButton className="mr-2.5" Icon={MicroBars} onClick={onOpenMenu} />
            <Search />
        </div>
    );
}
