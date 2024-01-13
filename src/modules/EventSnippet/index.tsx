import React, { ReactElement, ReactNode, useCallback, useState } from 'react';
import './styles.css';
import { Pause } from '@aiera/client-sdk/components/Svg/Pause';
import { Play } from '@aiera/client-sdk/components/Svg/Play';
import classNames from 'classnames';

interface EventSnippetSharedProps {
    children?: ReactNode;
}

/** @notExported */
interface EventSnippetUIProps extends EventSnippetSharedProps {}

export function EventSnippetUI(props: EventSnippetUIProps): ReactElement {
    const [isPlaying, setIsPlaying] = useState(false);
    const togglePlayback = useCallback(() => setIsPlaying((pv) => !pv), []);
    const { children } = props;
    return (
        <div>
            {children || (
                <div className="flex flex-col rounded-lg border px-5 py-[18px] relative antialiased">
                    <div className="flex items-center">
                        <div className="flex flex-col justify-center flex-1">
                            <p className="text-base font-bold">Aiera Inc, Earnings</p>
                            <p className="text-sm text-slate-500 leading-3">7:30 PM, Jan 13, 2024</p>
                        </div>
                        <p className="text-xs tracking-wide text-orange-600 font-semibold mr-2">AIERA</p>
                    </div>
                    <div>
                        <p className="text-[200px] leading-[200px] font-serif absolute top-14 left-2 text-slate-100">
                            “
                        </p>
                        <p className="text-[200px] leading-[100px] font-serif absolute bottom-0 right-2 text-slate-100">
                            ”
                        </p>
                        <p className="text-base py-10 px-6 relative z-10">
                            In scelerisque suscipit mauris eu fermentum. Ut sed suscipit lacus, vel bibendum mi. Cras
                            feugiat nunc arcu, vitae commodo turpis porttitor id. Integer accumsan, libero in consequat
                            consectetur, odio magna laoreet lacus, eu ultricies leo metus a mauris. Curabitur placerat
                            lectus quis metus pulvinar, elementum tempus ipsum dictum. Etiam imperdiet interdum
                            ullamcorper. Nulla dolor odio, cursus a felis nec, lacinia ultricies velit. Fusce volutpat
                            risus ex, a blandit sem tempor et.
                        </p>
                    </div>
                    <div className="flex items-center relative z-10">
                        <div className="h-9 w-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                            <p className="font-bold text-base">KS</p>
                        </div>
                        <div className="flex flex-col justify-center ml-2 flex-1">
                            <p className="text-base leading-[14px] font-bold">Ken Sena</p>
                            <p className="text-sm text-slate-500 leading-3 mt-1">CEO, Aiera Inc.</p>
                        </div>
                        <div
                            className={classNames(
                                'group flex items-center justify-center w-9 h-9 rounded-full border cursor-pointer shadow-sm dark:border-blue-600',
                                {
                                    'hover:border-blue-500 dark:hover:border-blue-500': !isPlaying,
                                    'active:border-blue-600 dark:hover:border-blue-700': !isPlaying,
                                    'border-blue-600': isPlaying,
                                    'text-blue-600 dark:text-white': !isPlaying,
                                    'text-white': isPlaying,
                                    'bg-blue-600': isPlaying,
                                    'bg-white dark:bg-blue-600': !isPlaying,
                                    'dark:hover:bg-blue-700': !isPlaying,
                                    'hover:bg-blue-700 dark:hover:bg-blue-700': isPlaying,
                                    'hover:border-blue-700': isPlaying,
                                    'active:bg-blue-800': isPlaying,
                                    'active:border-blue-800': isPlaying,
                                    'active:bg-blue-600': !isPlaying,
                                    'active:text-white': !isPlaying,
                                },
                                'button__play'
                            )}
                            onClick={togglePlayback}
                        >
                            {isPlaying ? (
                                <Pause className="w-3" />
                            ) : (
                                <Play className="ml-1 w-4 h-4 group-active:text-current" />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/** @notExported */
export interface EventSnippetProps extends EventSnippetSharedProps {}

/**
 * Renders EventSnippet
 */
export function EventSnippet(props: EventSnippetProps): ReactElement {
    const { children } = props;
    return <EventSnippetUI>{children}</EventSnippetUI>;
}
