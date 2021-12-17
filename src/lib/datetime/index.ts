/**
 * Simple function that returns true if the given date is today
 *
 * @param date - the date to compare against today
 * @returns    - a boolean
 */
export function isToday(date: Date | string): boolean {
    const today = new Date();
    const someDate = typeof date === 'string' ? new Date(date) : date;
    return (
        someDate.getDate() == today.getDate() &&
        someDate.getMonth() == today.getMonth() &&
        someDate.getFullYear() == today.getFullYear()
    );
}
