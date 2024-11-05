import React from 'react';
import { Panel } from '../Panel';
import { MicroStack } from '@aiera/client-sdk/components/Svg/MicroStack';

export function Sources({ onClose }: { onClose: () => void }) {
    return (
        <Panel className="px-5 mt-4" Icon={MicroStack} title="Chat Sources" onClose={onClose} side="right">
            Sources
        </Panel>
    );
}
