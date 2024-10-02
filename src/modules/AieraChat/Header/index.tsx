import { MicroBars } from '@aiera/client-sdk/components/Svg/MicroBars';
import { MicroGear } from '@aiera/client-sdk/components/Svg/MicroGear';
import { MicroStack } from '@aiera/client-sdk/components/Svg/MicroStack';
import React from 'react';
import { IconButton } from './IconButton';
import { Search } from './Search';

export function Header({ title }: { title: string }) {
    return (
        <div className="flex items-center justify-between mx-3 mt-4">
            <IconButton Icon={MicroBars} />
            <Search title={title} />
            <IconButton className="mx-2.5" Icon={MicroStack} />
            <IconButton Icon={MicroGear} />
        </div>
    );
}
