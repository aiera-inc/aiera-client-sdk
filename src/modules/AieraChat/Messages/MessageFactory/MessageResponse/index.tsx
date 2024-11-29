import React from 'react';
import { ChatMessage } from '../../../services/messages';
import { useChatStore } from '../../../store';
import { Citation } from '../Citation';
import { Loading } from '../Loading';
import { Footer } from './Footer';

export const MessageResponse = ({ data, onReRun }: { onReRun: (k: string) => void; data: ChatMessage }) => {
    const { searchTerm } = useChatStore();

    return data.status === 'thinking' ? (
        <Loading>Thinking...</Loading>
    ) : (
        <div className="pb-10 flex flex-col">
            <div className="pt-4 pl-4 pb-4 pr-2 text-base">
                {searchTerm
                    ? data.text
                          .split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
                          .map((part, index) =>
                              part.toLowerCase() === searchTerm.toLowerCase() ? (
                                  <mark key={index} className="bg-yellow-400">
                                      {part}
                                  </mark>
                              ) : (
                                  part
                              )
                          )
                    : data.text}
                {data.status === 'finished' && <Citation />}
            </div>
            {data.status === 'finished' && <Footer data={data} onReRun={onReRun} />}
        </div>
    );
};
