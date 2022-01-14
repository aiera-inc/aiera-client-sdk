/**
 * Simple function that returns true if the given dates are the same day
 *
 * @param date      - the first date to compare
 * @param otherDate - the second date to compare
 * @returns         - a boolean
 */
export function areDatesSameDay(date: Date | string, otherDate: Date | string): boolean {
    const date1 = typeof date === 'string' ? new Date(date) : date;
    const date2 = typeof otherDate === 'string' ? new Date(otherDate) : otherDate;
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );
}

/**
 * Simple function that returns true if the given date is today
 *
 * @param date - the date to compare against today
 * @returns    - a boolean
 */
export function isToday(date: Date | string): boolean {
    return areDatesSameDay(new Date(), typeof date === 'string' ? new Date(date) : date);
}
