import { useCallback, useEffect, useState } from 'react';

/*
 * The DaytaPicker
 * This component returns everything necessary to render a datepicker
 * or calendar component. It manages the viewing state in its own "window",
 * but starts based on a passed in "selected date";
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function useDaytaPicker({ selectedDate, monthOffset }: { selectedDate: Date; monthOffset?: number }) {
    const [dateWindow, setWindow] = useState(new Date());
    const monthIndex = dateWindow.getMonth();
    const month = MONTHS[monthIndex];
    const year = dateWindow.getFullYear();

    // We're getting the last day of the prior month when we pass in zero.
    // so we need to bump the monthIndex by 1
    const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const totalDaysInPreviousMonth = new Date(year, monthIndex, 0).getDate();
    const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();
    const totalDaysInFirstWeek = 7 - firstDayOfWeek;
    const totalWeeksToRender = Math.ceil((totalDaysInMonth - totalDaysInFirstWeek) / 7 + 1);
    const totalDaysToRender = totalWeeksToRender * 7;
    const firstWeekOffset = 7 - totalDaysInFirstWeek;
    let initialOffset = firstWeekOffset;
    const weeks = [];
    let days = [];

    const today = new Date();
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();
    const selectedDay = selectedDate.getDate();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    const thisDay = today.getDate();
    const selectedIsVisible = selectedMonth === monthIndex && selectedYear === year;
    const todayIsVisible = thisMonth === monthIndex && thisYear === year;
    const todayIsSelected = thisMonth === selectedMonth && thisYear === selectedYear && thisDay === selectedDay;

    for (let renderedDays = 1; renderedDays <= totalDaysToRender; renderedDays += 1) {
        if (initialOffset > 0) {
            // First we're getting the days from the previous month,
            // which share the current month's first week

            // We want one less previous day, as we want to end
            // at zero, so we get the last day in the month
            const offset = initialOffset - 1;

            // Getting days from the end of the previous month
            const day = totalDaysInPreviousMonth - offset;
            days.push({
                day,
                date: monthIndex === 0 ? new Date(year - 1, 11, day) : new Date(year, monthIndex - 1, day),
                currentMonth: false,
                isToday: false,
                isSelected: false,
            });
            //days.push({ day, currentMonth: false });
            initialOffset -= 1;
        } else if (renderedDays - firstWeekOffset > totalDaysInMonth) {
            // Getting the days for the last week of this month
            // which is shared with the next month
            // we take the days rendered so far, subtract the offset,
            // and days in the current month
            const day = renderedDays - firstWeekOffset - totalDaysInMonth;
            days.push({
                day,
                date: monthIndex === 11 ? new Date(year + 1, 0, day) : new Date(year, monthIndex + 1, day),
                currentMonth: false,
                isToday: false,
                isSelected: false,
            });
        } else {
            const currentDay = renderedDays - firstWeekOffset;
            let isToday = false;
            let isSelected = false;
            if (selectedIsVisible && selectedDay === currentDay) {
                isSelected = true;
            }
            if (todayIsVisible && thisDay === currentDay) {
                isToday = true;
            }
            // Rendering the normal days of this month
            // the amount of days rendered so far, minus the first week offset
            days.push({
                day: currentDay,
                date: new Date(year, monthIndex, currentDay),
                currentMonth: true,
                isToday,
                isSelected,
            });
        }

        // Move the days into a week
        // reset the days
        if (renderedDays % 7 === 0) {
            weeks.push(days);
            days = [];
        }
    }

    // We always want 6 weeks
    // so the UI is consistent
    if (weeks.length === 5 && weeks[4] && weeks[4][6]) {
        const lastDay = weeks[4][6].day;
        const extraWeek = [];
        for (let ct = 1; ct <= 7; ct += 1) {
            extraWeek.push({
                day: lastDay + ct,
                date: new Date(year, monthIndex + 1, lastDay + ct),
                currentMonth: false,
                isToday: false,
                isSelected: false,
            });
        }
        weeks.push(extraWeek);
    }

    const seekYears = useCallback(
        (years: number) => {
            const time = dateWindow.getTime();
            const ym = 31556952000; // milliseconds in year
            const newTime = ym * years + time;
            setWindow(new Date(newTime));
        },
        [dateWindow, setWindow]
    );

    const seekYear = useCallback(
        (year: number) => {
            setWindow(new Date(year, monthIndex, dateWindow.getDate()));
        },
        [dateWindow, monthIndex, setWindow]
    );

    const seekMonths = useCallback(
        (months: number, fromSelected?: boolean) => {
            const time = fromSelected ? selectedDate.getTime() : dateWindow.getTime();
            const mm = 2629800000; // milliseconds in month
            const newTime = mm * months + time;
            setWindow(new Date(newTime));
        },
        [dateWindow, setWindow]
    );

    const seekMonth = useCallback(
        (month: number) => {
            setWindow(new Date(dateWindow.getFullYear(), month, dateWindow.getDate()));
        },
        [dateWindow, setWindow]
    );

    const seekToday = useCallback(() => {
        setWindow(new Date());
    }, [setWindow]);

    // Change the window month by prop
    useEffect(() => {
        if (monthOffset) {
            seekMonths(monthOffset);
        }
    }, [monthOffset]);

    // send
    // months, days
    // month, year, selectDay

    return {
        weeks,
        month,
        year,
        seekMonths,
        seekMonth,
        seekToday,
        seekYears,
        seekYear,
        todayIsVisible,
        todayIsSelected,
        selectedDateIsVisible: selectedIsVisible,
    };
}
