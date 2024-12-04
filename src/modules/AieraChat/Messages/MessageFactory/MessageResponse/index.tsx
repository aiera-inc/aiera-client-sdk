import React from 'react';
import { ChatMessage } from '../../../services/messages';
import { Block } from '../Block';
import { Loading } from '../Loading';
import { Footer } from './Footer';

export const MessageResponse = ({ data, onReRun }: { onReRun: (k: string) => void; data: ChatMessage }) => {
    return data.status === 'thinking' ? (
        <Loading>Thinking...</Loading>
    ) : (
        <div className="pb-10 flex flex-col">
            <div className="flex flex-col pl-4 pr-2">
                {data.blocks?.map((block) => (
                    <Block {...block} />
                ))}
            </div>
            {data.status === 'finished' && <Footer data={data} onReRun={onReRun} />}
        </div>
    );
};
