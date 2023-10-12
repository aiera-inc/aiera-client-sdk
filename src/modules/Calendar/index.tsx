import classNames from 'classnames';
import React, { ReactElement } from 'react';

import { useSettings } from '@aiera/client-sdk/lib/data';
import { ChangeHandler } from '@aiera/client-sdk/types';
import { useDaytaPicker } from './data';
import './styles.css';

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
            <div className="flex">
                {month && year && <p className="text-base flex-1">{`${month} ${year}`}</p>}
                {!todayIsVisible && (
                    <p className="text-base" onClick={seekToday}>
                        Today
                    </p>
                )}
                <p className="text-base" onClick={() => seekMonths(1)}>
                    Next
                </p>
                <p className="text-base" onClick={() => seekMonths(-1)}>
                    Prev
                </p>
            </div>
            <div className="flex justify-around font-semibold text-slate-400">
                <p className="text-sm w-8 text-center">S</p>
                <p className="text-sm w-8 text-center">M</p>
                <p className="text-sm w-8 text-center">T</p>
                <p className="text-sm w-8 text-center">W</p>
                <p className="text-sm w-8 text-center">T</p>
                <p className="text-sm w-8 text-center">F</p>
                <p className="text-sm w-8 text-center">S</p>
            </div>
            {weeks.map((days, index) => (
                <div key={`week-${index}`} className="flex justify-around">
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
