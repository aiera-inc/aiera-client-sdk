import classNames from 'classnames';
import React, { ReactElement } from 'react';

import { useSettings } from '@aiera/client-sdk/lib/data';
import { ChangeHandler } from '@aiera/client-sdk/types';
import { useDaytaPicker } from './data';
import './styles.css';
import { Chevron } from '@aiera/client-sdk/components/Svg/Chevron';

interface CalendarSharedProps {
    onSelectDate: ChangeHandler<Date>;
    selectedDate: Date;
}

/** @notExported */
interface CalendarUIProps extends CalendarSharedProps {
    darkMode?: boolean;
}

export function CalendarUI(props: CalendarUIProps): ReactElement {
    const { selectedDate = new Date(), darkMode, onSelectDate } = props;
    const { weeks, month, year, seekMonths, seekToday, todayIsVisible } = useDaytaPicker({ selectedDate });
    return (
        <div className={classNames('h-full flex flex-col pb-2 calendar', { dark: darkMode })}>
            <div className="flex mb-2">
                <div className="flex flex-1 items-center">
                    {month && year && (
                        <p className="text-base font-bold tracking-tight antialiased">{`${month} ${year}`}</p>
                    )}
                    {!todayIsVisible && (
                        <div
                            className="ml-2 cursor-pointer flex bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-md text-slate-500 items-center px-1.5"
                            onClick={seekToday}
                        >
                            <p className="text-sm text-slate-500">Go to Today</p>
                        </div>
                    )}
                </div>
                <div
                    className="cursor-pointer flex bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-md text-slate-500 items-center pl-1.5 pr-2"
                    onClick={() => seekMonths(-1)}
                >
                    <Chevron className="w-2.5 rotate-90" />
                    <p className="text-sm ml-1">Prev</p>
                </div>
                <div
                    className="cursor-pointer ml-2 flex bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-md text-slate-500 items-center pr-1.5 pl-2"
                    onClick={() => seekMonths(1)}
                >
                    <p className="text-sm mr-1">Next</p>
                    <Chevron className="w-2.5 -rotate-90" />
                </div>
            </div>
            <div className="flex justify-between font-semibold text-slate-400">
                <p className="text-sm w-8 text-center">S</p>
                <p className="text-sm w-8 text-center">M</p>
                <p className="text-sm w-8 text-center">T</p>
                <p className="text-sm w-8 text-center">W</p>
                <p className="text-sm w-8 text-center">T</p>
                <p className="text-sm w-8 text-center">F</p>
                <p className="text-sm w-8 text-center">S</p>
            </div>
            {weeks.map((days, index) => (
                <div key={`week-${index}`} className="flex justify-between">
                    {days.map(({ day, currentMonth, isToday, isSelected, date }) => (
                        <div
                            key={day}
                            onClick={(e) => onSelectDate(e, { name: 'date', value: date })}
                            className={classNames(
                                'rounded-full text-base h-8 w-8',
                                'flex items-center justify-center',
                                'cursor-pointer',
                                {
                                    'text-slate-400': !currentMonth,
                                    'bg-blue-600 text-white': isToday,
                                    'hover:border-2 hover:border-orange-400 active:border-rose-600':
                                        !isSelected && isToday,
                                    'hover:bg-rose-100 active:bg-rose-200': !isSelected && !isToday,
                                    'border-2 border-rose-500': isSelected,
                                }
                            )}
                        >
                            {day}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

/** @notExported */
export interface CalendarProps extends CalendarSharedProps {}

/**
 * Renders News
 */
export function Calendar({ selectedDate, onSelectDate }: CalendarProps): ReactElement {
    const { settings } = useSettings();
    return <CalendarUI darkMode={settings.darkMode} selectedDate={selectedDate} onSelectDate={onSelectDate} />;
}
