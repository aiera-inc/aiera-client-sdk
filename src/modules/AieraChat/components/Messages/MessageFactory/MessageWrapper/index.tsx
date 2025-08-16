import React, { ReactNode } from 'react';

export const MessageWrapper = ({ children }: { children: ReactNode }) => {
    return <div className="flex flex-col pb-6 mx-4">{children}</div>;
};
