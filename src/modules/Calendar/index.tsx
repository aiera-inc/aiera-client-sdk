import classNames from 'classnames';
import React, { ReactElement, useState } from 'react';

import './styles.css';
import { useSettings } from '@aiera/client-sdk/lib/data';
import { useDaytaPicker } from './data';

interface CalendarSharedProps {}

/** @notExported */
interface CalendarUIProps extends CalendarSharedProps {
    onSelectDate: (d: Date) => void;
    selectedDate: Date;
    darkMode?: boolean;
}

export function CalendarUI(props: CalendarUIProps): ReactElement {
    const { selectedDate, darkMode, onSelectDate } = props;
    const { weeks, month, year, seekMonths, seekToday, todayIsVisible } = useDaytaPicker({ selectedDate });
    return (
        <div className={classNames('h-full flex flex-col calendar', { dark: darkMode })}>
            <div className="flex">
                <p className="text-base flex-1">{`${month} ${year}`}</p>
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
            <div className="flex justify-around">
                <p className="text-sm">S</p>
                <p className="text-sm">M</p>
                <p className="text-sm">T</p>
                <p className="text-sm">W</p>
                <p className="text-sm">T</p>
                <p className="text-sm">F</p>
                <p className="text-sm">S</p>
            </div>
            {weeks.map((days, index) => (
                <div key={`week-${month}-${index}`} className="flex justify-around">
                    {days.map(({ day, currentMonth, isToday, isSelected, date }) => (
                        <div
                            key={day}
                            onClick={() => onSelectDate(date)}
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
export function Calendar(): ReactElement {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { settings } = useSettings();
    return <CalendarUI darkMode={settings.darkMode} selectedDate={selectedDate} onSelectDate={setSelectedDate} />;
}
