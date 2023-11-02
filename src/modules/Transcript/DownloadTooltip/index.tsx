import { useQuery } from '@aiera/client-sdk/api/client';
import { CurrentUserQuery, TranscriptQuery } from '@aiera/client-sdk/types/generated';
import classNames from 'classnames';
import gql from 'graphql-tag';
import React, { ReactElement } from 'react';
import './styles.css';

export type Event = TranscriptQuery['events'][0];

interface DownloadTooltipSharedProps {
    event: Event;
}

/** @notExported */
interface DownloadTooltipUIProps extends DownloadTooltipProps {}

export function DownloadTooltipUI(props: DownloadTooltipUIProps): ReactElement {
    const { event } = props;
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

    return (
        <div
            className={classNames(
                'flex flex-col justify-start border-t-[1px] border-gray-100 px-3 dark:border-bluegray-5',
                'transcript__header__details'
            )}
        >
            Download
            {userQuery.state.data?.currentUser?.apiKey && event.connectionStatus === 'transcribed' && (
                <div className="flex my-3 px-3.5">
                    <span className="font-semibold flex-shrink-0 block w-28 mr-1">Transcript </span>
                    <span className="block truncate">
                        <a
                            className="text-blue-600 hover:text-blue-700 active:text-blue-800 hover:underline"
                            href={
                                `https://audio` +
                                (process.env.NODE_ENV !== 'production' ? `-dev` : '') +
                                `.aiera.com/api/events/${event.id}/audio/transcript?api_key=${userQuery.state.data.currentUser.apiKey}`
                            }
                            rel="noreferrer"
                            download={true}
                        >
                            Download PDF
                        </a>
                    </span>
                </div>
            )}
        </div>
    );
}

/** @notExported */
export interface DownloadTooltipProps extends DownloadTooltipSharedProps {}

/**
 * Renders EventDetails
 */
export function DownloadTooltip(props: DownloadTooltipProps): ReactElement {
    const { event } = props;
    return <DownloadTooltipUI event={event} />;
}
