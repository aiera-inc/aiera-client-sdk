import { MicroSparkles } from '@aiera/client-sdk/components/Svg/MicroSparkles';
import React, { ReactNode } from 'react';

export const Loading = ({ children }: { children: ReactNode }) => {
    return (
        <div className="flex items-center py-4 justify-center text-base">
            <MicroSparkles className="w-4 mr-1.5 animate-bounce text-yellow-400" />
            <p className="font-semibold antialiased">{children}</p>
        </div>
    );
};
