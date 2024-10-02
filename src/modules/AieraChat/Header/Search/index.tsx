import { MicroCloseCircle } from '@aiera/client-sdk/components/Svg/MicroCloseCircle';
import { MicroSearch } from '@aiera/client-sdk/components/Svg/MicroSearch';
import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { IconButton } from '../IconButton';
import { Chevron } from '@aiera/client-sdk/components/Svg/Chevron';

export function Search({ title }: { title: string }) {
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const onCloseSearch = useCallback(() => {
        setShowSearch(false);
        setSearchTerm('');
    }, []);
    return showSearch ? (
        <div className="bg-slate-200 relative rounded-lg h-[1.875rem] flex-1 ml-2.5 flex items-center">
            <input
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
                autoFocus
                placeholder="Search Chat..."
                className="bg-transparent z-10 antialiased text-base font-medium outline-none absolute inset-0 leading-[1.875rem] pl-2.5"
            />
            {searchTerm.length > 0 && (
                <>
                    <p
                        className={classNames(
                            'absolute pointer-events-none left-1.5 antialiased',
                            'px-1 top-1.5 font-medium bottom-1.5 leading-[1.125rem]',
                            'text-base bg-yellow-400 text-transparent rounded-md'
                        )}
                    >
                        {searchTerm}
                    </p>
                    <div className="absolute z-20 top-0 bottom-0 right-9 flex items-center text-sm text-slate-600">
                        <div className="cursor-pointer hover:text-black">
                            <Chevron className="w-2" />
                        </div>
                        <p className="px-2">1 / 2</p>
                        <div className="cursor-pointer hover:text-black">
                            <Chevron className="w-2 rotate-180" />
                        </div>
                    </div>
                </>
            )}
            <div
                onClick={onCloseSearch}
                className={classNames(
                    'absolute right-2 top-0 bottom-0 z-20 flex items-center justify-center',
                    'cursor-pointer text-slate-400 hover:text-slate-600'
                )}
            >
                <MicroCloseCircle className="w-4" />
            </div>
        </div>
    ) : (
        <>
            <IconButton onClick={() => setShowSearch(true)} className="mx-2.5" Icon={MicroSearch} />
            <div className="flex-1 flex items-center justify-center text-base font-bold">
                <p className="antialiased">{title}</p>
            </div>
        </>
    );
}
