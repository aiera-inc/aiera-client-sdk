import React, { ReactElement } from 'react';
import { TranscriptQuery } from '@aiera/client-sdk/types/generated';
import classNames from 'classnames';
import { ExpandButton } from '@aiera/client-sdk/components/ExpandButton';
import './styles.css';

export type Event = TranscriptQuery['events'][0];
interface EventDetailsSharedProps {
    eventDetailsExpanded: boolean;
    toggleEventDetails: () => void;
    event: Event;
}

/** @notExported */
interface EventDetailsUIProps extends EventDetailsSharedProps {}

export function EventDetailsUI(props: EventDetailsUIProps): ReactElement {
    const { event, eventDetailsExpanded, toggleEventDetails } = props;
    return (
        <div className="flex flex-col justify-start border-t-[1px] border-gray-100 px-3 dark:border-bluegray-5">
            <div className="flex items-center justify-start h-10 cursor-pointer group" onClick={toggleEventDetails}>
                <span className="text-sm block font-semibold w-28 mr-1 dark:text-white">Event Details</span>
                <span className="text-gray-400 text-sm text-right flex-1 truncate group-hover:text-gray-600">
                    Connection Info, Slides, Downloads...
                </span>
                <ExpandButton
                    className={classNames('ml-3', {
                        'group-hover:bg-gray-200 dark:group-hover:bg-bluegray-4 dark:group-hover:bg-opacity-50':
                            !eventDetailsExpanded,
                        'group-hover:bg-blue-700': eventDetailsExpanded,
                        'group-active:bg-gray-400 dark:group-active:bg-bluegray-7': !eventDetailsExpanded,
                        'group-active:bg-blue-900': eventDetailsExpanded,
                    })}
                    onClick={toggleEventDetails}
                    expanded={eventDetailsExpanded}
                />
            </div>
            {eventDetailsExpanded && (
                <div className="text-sm border-[1px] rounded-lg border-gray-200 mb-3.5 dark:border-bluegray-5 dark:text-bluegray-4">
                    {event.dialInPhoneNumbers && event.dialInPhoneNumbers.length > 0 && (
                        <div className="flex my-3 px-3.5">
                            <span className="font-semibold flex-shrink-0 block w-28 mr-1">Phone number</span>
                            <div>
                                {event.dialInPhoneNumbers.map((number: string) => (
                                    <div key={number}>{number}</div>
                                ))}
                            </div>
                        </div>
                    )}
                    {event.dialInPin && (
                        <div className="flex my-3 px-3.5">
                            <span className="font-semibold flex-shrink-0 block w-28 mr-1">Pin Number</span>
                            <span>{event?.dialInPin}</span>
                        </div>
                    )}
                    {event.webcastUrls.length > 0 && (
                        <div className="flex my-3 px-3.5">
                            <span className="font-semibold flex-shrink-0 block w-28 mr-1">Webcast</span>
                            <div className="overflow-hidden truncate">
                                {event.webcastUrls?.map((url: string) => (
                                    <div key={url} className="block truncate">
                                        <a
                                            className="text-blue-600 hover:text-blue-700 active:text-blue-800 hover:underline"
                                            href={url}
                                            rel="noreferrer"
                                            target="_blank"
                                        >
                                            {url}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {event.audioRecordingUrl && (
                        <div className="flex my-3 px-3.5">
                            <span className="font-semibold flex-shrink-0 block w-28 mr-1">Download MP3</span>
                            <span className="block truncate">
                                <a
                                    className="text-blue-600 hover:text-blue-700 active:text-blue-800 hover:underline"
                                    href={event.audioRecordingUrl}
                                    rel="noreferrer"
                                    target="_blank"
                                >
                                    {event.audioRecordingUrl}
                                </a>
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/** @notExported */
export interface EventDetailsProps extends EventDetailsSharedProps {}

/**
 * Renders EventDetails
 */
export function EventDetails(props: EventDetailsProps): ReactElement {
    const { event, eventDetailsExpanded, toggleEventDetails } = props;
    return (
        <EventDetailsUI
            event={event}
            eventDetailsExpanded={eventDetailsExpanded}
            toggleEventDetails={toggleEventDetails}
        />
    );
}
