import { LogoMark } from '@aiera/client-sdk/components/Svg/LogoMark';
import React, { ReactNode } from 'react';

export const MessageWrapper = ({ children }: { children: ReactNode }) => {
    return (
        <div className="flex items-start pb-6 pl-2">
            <div className="h-10 flex-shrink-0 w-10 bg-slate-950 rounded-xl flex items-center justify-center">
                <LogoMark className="w-8" />
            </div>
            <div className="flex flex-col">{children}</div>
        </div>
    );
};
