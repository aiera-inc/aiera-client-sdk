import { useEffect, useState } from 'react';
import { format, TDate } from 'timeago.js';

/**
 *  Accepts a date and returns a human-friendly string
 *  for how long ago or how soon from now the date is
 *
 *  @param date     - the date to reformat
 *  @param realtime - a bool for automatically updating the formatted date
 *                    using a timeout
 *  @returns        - the given date formatted in terms of how long ago or
 *                    how soon from now it is
 */
export function useTimeAgo(date: TDate, realtime?: boolean): TDate {
    const [timeAgo, setTimeAgo] = useState<TDate>(format(date));

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (realtime) {
            // Get number of seconds between now and the date we're working with
            const diff = Math.abs(new Date().getTime() - new Date(date).getTime());
            // Default to every hour
            let next = 3600;
            if (diff <= 60) {
                // If less than a minute, run every second
                next = 1;
            } else if (diff <= 3600) {
                // If less than 1 hour, run every minute
                next = 60;
            } else if (diff <= 86400) {
                // If less than 24 hours, run every 30 minutes
                next = 1800;
            }
            timeout = setTimeout(() => setTimeAgo(format(date)), next * 1000);
        }
        return () => {
            // Cancel all realtime render tasks
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, [date]);

    return timeAgo;
}
