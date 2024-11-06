import React from 'react';
import { Panel } from '../Panel';
import { MicroStack } from '@aiera/client-sdk/components/Svg/MicroStack';
import { MicroTrash } from '@aiera/client-sdk/components/Svg/MicroTrash';

const data = [
    {
        eventId: '1',
        title: 'AAPL Q2 2024 Earnings call',
    },
    {
        eventId: '2',
        title: 'TSLA Q3 2024 Earnings call',
    },
    {
        eventId: '3',
        title: 'META Q2 2024 Earnings call',
    },
];

export function Sources({ onClose }: { onClose: () => void }) {
    return (
        <Panel className="px-5 mt-4" Icon={MicroStack} title="Chat Sources" onClose={onClose} side="right">
            <div className="flex flex-col flex-1">
                <input
                    type="text"
                    name="source_autocomplete"
                    className="text-sm border border-slate-200 focus:outline focus:border-transparent outline-2 outline-blue-700 rounded-full h-8 px-3 mb-4"
                    placeholder="Add Source..."
                />
                {data.map(({ eventId, title }) => (
                    <div
                        key={eventId}
                        className="flex hover:bg-slate-200/80 pl-2.5 ml-0.5 pr-1.5 mr-1.5 rounded-lg flex-1 justify-between items-center py-1 text-slate-600"
                    >
                        <p className="text-sm line-clamp-1 hover:text-blue-700 cursor-pointer">{title}</p>
                        <MicroTrash className="w-4 ml-2 hover:text-red-600 cursor-pointer" />
                    </div>
                ))}
            </div>
        </Panel>
    );
}
