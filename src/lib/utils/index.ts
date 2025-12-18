function fallbackCopyToClipboard(text: string): Promise<void> {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Prevent scrolling to bottom
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);

    try {
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        return Promise.resolve();
    } catch (error) {
        console.warn('Fallback clipboard copy failed:', error);
        return Promise.reject(error);
    } finally {
        document.body.removeChild(textArea);
    }
}

export async function copyToClipboard(text: string): Promise<void> {
    // Modern clipboard API available
    if (window.navigator.clipboard) {
        try {
            // Try direct clipboard write first (works in secure contexts)
            await window.navigator.clipboard.writeText(text);
            return;
        } catch (error) {
            // If direct write fails, check permissions
            try {
                const permissionStatus = await navigator.permissions.query({
                    name: 'clipboard-write' as PermissionName,
                });

                if (permissionStatus.state === 'granted') {
                    await window.navigator.clipboard.writeText(text);
                    return;
                }
            } catch {
                // Permission check failed, fall back to legacy method
            }
        }
    }

    // Fall back to legacy method if any of the above fails
    return fallbackCopyToClipboard(text);
}

type LogLevel = 'log' | 'debug' | 'info' | 'warn' | 'error';

function isProductionEnvironment(): boolean {
    const nodeEnv = process.env.NODE_ENV;
    const apiUrl = process.env.AIERA_SDK_API_URL || '';

    return nodeEnv === 'production' || (apiUrl.includes('api.aiera.com') && !apiUrl.includes('api-dev'));
}

export function log(message: string, logLevel: LogLevel = 'log', data?: object): void {
    if (isProductionEnvironment()) {
        return;
    }

    const logMethod = console[logLevel] || console.log;
    data ? logMethod(message, data) : logMethod(message);
}

/**
 * Formats a date to iCalendar format (YYYYMMDDTHHmmssZ)
 */
function formatICalDate(date: Date): string {
    const isoString = date.toISOString().replace(/[-:]/g, '');
    const formatted = isoString.split('.')[0] || '';
    return `${formatted}Z`;
}

/**
 * Formats dates for Google Calendar URL (YYYYMMDDTHHmmssZ)
 */
function formatGoogleCalendarDate(date: Date): string {
    const isoString = date.toISOString().replace(/[-:]/g, '');
    const formatted = isoString.split('.')[0] || '';
    return `${formatted}Z`;
}

interface CalendarEventOptions {
    title: string;
    startDate: Date | string;
    durationMinutes?: number;
    description?: string;
    location?: string;
}

/**
 * Generates .ics (iCalendar) file content for a calendar event
 *
 * @param options - Event details including title, start date, duration, description, and location
 * @returns iCalendar format string
 */
export function generateICalendarContent(options: CalendarEventOptions): string {
    const { title, startDate, durationMinutes = 60, description = '', location = '' } = options;

    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    const now = new Date();

    // Generate a unique ID for the event
    const uid = `${start.getTime()}-${Math.random().toString(36).substring(2, 9)}@aiera.com`;

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Aiera//Event Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${formatICalDate(now)}`,
        `DTSTART:${formatICalDate(start)}`,
        `DTEND:${formatICalDate(end)}`,
        `SUMMARY:${title}`,
        description ? `DESCRIPTION:${description.replace(/\n/g, '\\n')}` : '',
        location ? `LOCATION:${location}` : '',
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR',
    ]
        .filter(Boolean)
        .join('\r\n');

    return icsContent;
}

/**
 * Generates a Google Calendar URL for adding an event
 *
 * @param options - Event details
 * @returns Google Calendar URL
 */
export function generateGoogleCalendarUrl(options: CalendarEventOptions): string {
    const { title, startDate, durationMinutes = 60, description = '', location = '' } = options;

    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${formatGoogleCalendarDate(start)}/${formatGoogleCalendarDate(end)}`,
        details: description,
        location: location,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates an Outlook Calendar URL for adding an event
 *
 * @param options - Event details
 * @returns Outlook Calendar URL
 */
export function generateOutlookCalendarUrl(options: CalendarEventOptions): string {
    const { title, startDate, durationMinutes = 60, description = '', location = '' } = options;

    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    const params = new URLSearchParams({
        path: '/calendar/action/compose',
        subject: title,
        startdt: start.toISOString(),
        enddt: end.toISOString(),
        body: description,
        location: location,
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Downloads a calendar event as an .ics file
 *
 * @param options - Event details including title, start date, duration, description, and location
 */
export function downloadCalendarEvent(options: CalendarEventOptions): void {
    const icsContent = generateICalendarContent(options);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${options.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object after a short delay
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
}
