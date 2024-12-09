import React from 'react';
import { ChatMessageResponse, ChatMessageStatus } from '../../../../services/messages';
import { Block } from '../Block';
import { Loading } from '../Loading';
import { Footer } from './Footer';

export const MessageResponse = ({ data, onReRun }: { onReRun: (k: string) => void; data: ChatMessageResponse }) => {
    return data.status === ChatMessageStatus.PENDING || data.status === ChatMessageStatus.QUEUED ? (
        <Loading>Thinking...</Loading>
    ) : (
        <div className="pb-10 flex flex-col">
            <div className="flex flex-col px-4 pb-2">
                {data.blocks?.map((block, index) => (
                    <Block {...block} key={index} />
                ))}
            </div>
            {data.status !== ChatMessageStatus.STREAMING && <Footer data={data} onReRun={onReRun} />}
        </div>
    );
};
