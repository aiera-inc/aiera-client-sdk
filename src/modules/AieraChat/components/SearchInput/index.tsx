import { MicroCloseCircle } from '@aiera/client-sdk/components/Svg/MicroCloseCircle';
import { useConfig } from '@aiera/client-sdk/lib/config';
import classNames from 'classnames';
import React from 'react';

export function SearchInput({
    autoFocus,
    value,
    onChange,
    placeholder = 'Search...',
    name,
    className,
}: {
    autoFocus?: boolean;
    name?: string;
    placeholder?: string;
    className?: string;
    onChange: (e?: string) => void;
    value?: string | number;
}) {
    const config = useConfig();
    return (
        <div className={classNames('relative flex items-center', className)}>
            <input
                autoFocus={autoFocus}
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                type="text"
                name={name}
                className={classNames(
                    'border flex-1 border-slate-200 focus:outline focus:border-transparent outline-2 outline-blue-700 rounded-full h-8 px-3',
                    {
                        'text-base': !config.options?.isMobile,
                        'text-lg': config.options?.isMobile,
                    }
                )}
                placeholder={placeholder}
            />
            {value && (
                <div
                    onClick={() => onChange(undefined)}
                    className="absolute right-2.5 top-2 cursor-pointer hover:text-slate-600 text-slate-400"
                >
                    <MicroCloseCircle className="w-4" />
                </div>
            )}
        </div>
    );
}
