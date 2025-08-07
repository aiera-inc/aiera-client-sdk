import { LogoMark } from '@aiera/client-sdk/components/Svg/LogoMark';
import classNames from 'classnames';
import React, { ReactNode } from 'react';

export const MessageWrapper = ({ children, isLoading }: { isLoading?: boolean; children: ReactNode }) => {
    return (
        <div className="flex items-start pb-6 pl-2">
            <div className="h-10 flex-shrink-0 w-10 bg-slate-950 rounded-xl flex items-center justify-center">
                <LogoMark
                    className={classNames('w-7', {
                        'animate-bounce -mb-2': isLoading,
                    })}
                />
            </div>
            <div className="flex flex-col">{children}</div>
        </div>
    );
};
