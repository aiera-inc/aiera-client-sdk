import { useQuery } from '@aiera/client-sdk/api/client';
import { ExpandButton } from '@aiera/client-sdk/components/ExpandButton';
import { CurrentUserQuery, TranscriptQuery } from '@aiera/client-sdk/types/generated';
import classNames from 'classnames';
import gql from 'graphql-tag';
import React, { ReactElement } from 'react';
import './styles.css';

export type Event = TranscriptQuery['events'][0];

interface EventDetailsSharedProps {
    eventDetailsExpanded: boolean;
    toggleEventDetails: () => void;
    event: Event;
    toggleReportIssueModal: (override?: boolean) => void;
}

/** @notExported */
interface EventDetailsUIProps extends EventDetailsSharedProps {}

export function EventDetailsUI(props: EventDetailsUIProps): ReactElement {
    const { event, eventDetailsExpanded, toggleEventDetails, toggleReportIssueModal } = props;
    const userQuery = useQuery<CurrentUserQuery>({
        requestPolicy: 'cache-only',
        query: gql`
            query CurrentUserQuery {
                currentUser {
                    id
                    apiKey
                }
            }
        `,
    });

    const attachments = event?.attachments?.filter((att) => att?.mimeType === 'application/pdf');
    const slides = attachments?.find((att) => att?.title === 'Slides')?.archivedUrl;
    const press = attachments?.find((att) => att?.title === 'Press Release')?.archivedUrl;

    return (
        <div
            className={classNames(
                'flex flex-col justify-start border-t-[1px] border-gray-100 px-3 dark:border-bluegray-5',
                'transcript__header__details'
            )}
        >
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
                            <span className="font-semibold flex-shrink-0 block w-32 mr-1">Phone number</span>
                            <div>
                                {event.dialInPhoneNumbers.map((number: string) => (
                                    <div key={number}>{number}</div>
                                ))}
                            </div>
                        </div>
                    )}
                    {event.dialInPin && (
                        <div className="flex my-3 px-3.5">
                            <span className="font-semibold flex-shrink-0 block w-32 mr-1">Pin Number</span>
                            <span>{event?.dialInPin}</span>
                        </div>
                    )}
                    {event.webcastUrls.length > 0 && (
                        <div className="flex my-3 px-3.5">
                            <span className="font-semibold flex-shrink-0 block w-32 mr-1">Webcast</span>
                            <div className="overflow-hidden truncate">
                                {event.webcastUrls?.map((url: string) => (
                                    <div key={url} className="block truncate">
                                        <a
                                            className="text-blue-600 hover:text-blue-700 active:text-blue-800 hover:underline"
                                            href={url}
                                            rel="noreferrer"
                                            target="_blank"
                                        >
                                            Open in new window
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {event.audioRecordingUrl && (
                        <div className="flex my-3 px-3.5">
                            <span className="font-semibold flex-shrink-0 block w-32 mr-1">Event Audio</span>
                            <span className="block truncate">
                                <a
                                    className="text-blue-600 hover:text-blue-700 active:text-blue-800 hover:underline"
                                    href={event.audioRecordingUrl}
                                    rel="noreferrer"
                                    target="_blank"
                                >
                                    Download MP3
                                </a>
                            </span>
                        </div>
                    )}
                    {slides && (
                        <div className="flex my-3 px-3.5">
                            <span className="font-semibold flex-shrink-0 block w-32 mr-1">Pres. Slides</span>
                            <span className="block truncate">
                                <a
                                    className="text-blue-600 hover:text-blue-700 active:text-blue-800 hover:underline"
                                    href={slides}
                                    rel="noreferrer"
                                    download
                                >
                                    Download PDF
                                </a>
                            </span>
                        </div>
                    )}
                    {press && (
                        <div className="flex my-3 px-3.5">
                            <span className="font-semibold flex-shrink-0 block w-32 mr-1">Press Release</span>
                            <span className="block truncate">
                                <a
                                    className="text-blue-600 hover:text-blue-700 active:text-blue-800 hover:underline"
                                    href={press}
                                    rel="noreferrer"
                                    target="_blank"
                                >
                                    Download PDF
                                </a>
                            </span>
                        </div>
                    )}
                    {userQuery.state.data?.currentUser?.apiKey && event.connectionStatus === 'transcribed' && (
                        <div className="flex my-3 px-3.5">
                            <span className="font-semibold flex-shrink-0 block w-32 mr-1">Transcript </span>
                            <span className="block truncate">
                                <a
                                    className="text-blue-600 hover:text-blue-700 active:text-blue-800 hover:underline"
                                    href={`https://audio.aiera.com/api/events/${event.id}/audio/transcript?api_key=${userQuery.state.data.currentUser.apiKey}`}
                                    rel="noreferrer"
                                    download={true}
                                >
                                    Download PDF
                                </a>
                            </span>
                        </div>
                    )}
                    <div className="flex my-3 px-3.5">
                        <span className="font-semibold flex-shrink-0 block w-32 mr-1">Event Problems</span>
                        <span className="block truncate">
                            <p
                                onClick={() => toggleReportIssueModal(true)}
                                className={classNames(
                                    'text-blue-600 hover:text-blue-700 active:text-blue-800 hover:underline',
                                    'cursor-pointer'
                                )}
                            >
                                Report Issue
                            </p>
                        </span>
                    </div>
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
    const { event, eventDetailsExpanded, toggleEventDetails, toggleReportIssueModal } = props;
    return (
        <EventDetailsUI
            toggleReportIssueModal={toggleReportIssueModal}
            event={event}
            eventDetailsExpanded={eventDetailsExpanded}
            toggleEventDetails={toggleEventDetails}
        />
    );
}
