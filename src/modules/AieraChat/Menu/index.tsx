import React from 'react';
import { Panel } from '../Panel';
import { MicroBars } from '@aiera/client-sdk/components/Svg/MicroBars';

export function Menu({ onClose }: { onClose: () => void }) {
    return (
        <Panel Icon={MicroBars} className="px-5 mt-4" onClose={onClose} title="Chat Menu" side="left">
            Menu
        </Panel>
    );
}
