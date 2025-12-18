import { Calendar } from '@aiera/client-sdk/components/Svg/Calendar';
import { Tooltip } from '@aiera/client-sdk/components/Tooltip';
import { TranscriptQuery } from '@aiera/client-sdk/types/generated';
import {
    downloadCalendarEvent,
    generateGoogleCalendarUrl,
    generateOutlookCalendarUrl,
} from '@aiera/client-sdk/lib/utils';
import React, { ReactElement } from 'react';
import './styles.css';

export type Event = TranscriptQuery['events'][0];

interface CalendarTooltipSharedProps {
    event: Event;
}

/** @notExported */
interface CalendarTooltipUIProps extends CalendarTooltipProps {}

export function CalendarTooltipUI(props: CalendarTooltipUIProps): ReactElement {
    const { event } = props;

    const calendarEventOptions = {
        title: event.title,
        startDate: event.eventDate,
        durationMinutes: 60, // Default to 1 hour
        description: `${event.eventType} - ${event.primaryCompany?.commonName || 'Aiera Event'}`,
        location: event.webcastUrls?.[0] || '',
    };

    return (
        <Tooltip
            yOffset={-8}
            xOffset={0}
            position="top-left"
            grow="up-right"
            openOn="click"
            modal
            content={({ hideTooltip }) => (
                <div className="shadow-md bg-white rounded-lg flex flex-col overflow-hidden">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const url = generateGoogleCalendarUrl(calendarEventOptions);
                            window.open(url, '_blank', 'noopener,noreferrer');
                            hideTooltip();
                        }}
                        className="h-9 px-3 hover:bg-blue-500 hover:text-white flex items-center"
                    >
                        <p className="text-sm">Google Calendar</p>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const url = generateOutlookCalendarUrl(calendarEventOptions);
                            window.open(url, '_blank', 'noopener,noreferrer');
                            hideTooltip();
                        }}
                        className="h-9 px-3 hover:bg-blue-500 hover:text-white flex items-center"
                    >
                        <p className="text-sm">Outlook Calendar</p>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            downloadCalendarEvent(calendarEventOptions);
                            hideTooltip();
                        }}
                        className="h-9 px-3 hover:bg-blue-500 hover:text-white flex items-center"
                    >
                        <p className="text-sm">Apple Calendar / Other</p>
                    </button>
                </div>
            )}
        >
            <button className="flex mt-4 items-center text-blue-600 dark:text-blue-100 text-left bg-blue-50 rounded-lg h-8 pr-3 pl-2.5 border-[1px] border-blue-100 cursor-pointer hover:bg-blue-100 dark:bg-bluegray-6 dark:hover:bg-bluegray-5 dark:border-bluegray-5">
                <Calendar className="w-3.5 mr-2" />
                <div className="text-sm leading-tight">Add to your calendar</div>
            </button>
        </Tooltip>
    );
}

/** @notExported */
export interface CalendarTooltipProps extends CalendarTooltipSharedProps {}

/**
 * Renders CalendarTooltip
 */
export function CalendarTooltip(props: CalendarTooltipProps): ReactElement {
    const { event } = props;
    return <CalendarTooltipUI event={event} />;
}
