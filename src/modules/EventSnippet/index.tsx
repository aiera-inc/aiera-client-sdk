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
        <div id="aiera-event-snippet">
            {children || (
                <div className="flex flex-col rounded-lg border border-slate-300/70 hover:border-slate-300 shadow-md shadow-slate-400/10 bg-white px-5 py-[18px] relative antialiased">
                    <div className="flex items-center">
                        <div className="flex flex-col justify-center flex-1">
                            <p className="text-base font-bold">Netflix, Inc | Earnings</p>
                            <p className="text-sm text-slate-500 leading-3">7:30 PM, Jan 13, 2024</p>
                        </div>
                        <p className="text-xs tracking-wide text-orange-600 font-semibold mr-2">NFLX</p>
                    </div>
                    <div>
                        <p className="text-[200px] leading-[200px] font-serif absolute top-14 left-2 text-slate-100">
                            “
                        </p>
                        <p className="text-[200px] leading-[100px] font-serif absolute bottom-0 right-2 text-slate-100">
                            ”
                        </p>
                        <p className="text-base py-10 px-6 relative z-10">
                            But at the very end of our last session together, the Gil presented this new demand that
                            kind of on top of everything for a per subscriber levy unrelated to viewing or success, and
                            this really broke our momentum, unfortunately. But you should know, we are incredibly and
                            totally committed to ending this strike. The industry, our communities and the economy are
                            all hurting. So we need to get a deal done that respects all sides as soon as we possibly
                            can.
                        </p>
                    </div>
                    <div className="flex items-center relative z-10">
                        <div className="h-9 w-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                            <p className="font-bold text-base">RH</p>
                        </div>
                        <div className="flex flex-col justify-center ml-2 flex-1">
                            <p className="text-base leading-[14px] font-bold">Reed Hastings</p>
                            <p className="text-sm text-slate-500 leading-3 mt-1">CEO, Netflix, Inc.</p>
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
