import React from 'react';
import { useChatStore } from '../../../../store';

export function SearchableText({ text }: { text: string }) {
    const { searchTerm } = useChatStore();
    return (
        <>
            {searchTerm
                ? text
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
                : text}
        </>
    );
}
