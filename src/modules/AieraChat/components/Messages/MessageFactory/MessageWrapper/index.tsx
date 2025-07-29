import React, { ReactNode } from 'react';

export const MessageWrapper = ({ children, isLoading }: { isLoading?: boolean; children: ReactNode }) => {
    return <div className="flex flex-col pb-6">{children}</div>;
};
