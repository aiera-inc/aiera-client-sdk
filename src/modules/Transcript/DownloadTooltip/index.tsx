import { useQuery } from '@aiera/client-sdk/api/client';
import { CurrentUserQuery, TranscriptQuery } from '@aiera/client-sdk/types/generated';
import classNames from 'classnames';
import gql from 'graphql-tag';
import React, { ReactElement } from 'react';
import './styles.css';
import { Tooltip } from '@aiera/client-sdk/components/Tooltip';
import { Button } from '@aiera/client-sdk/components/Button';
import { Download } from '@aiera/client-sdk/components/Svg/Download';

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
        <Tooltip
            yOffset={6}
            position="bottom-right"
            grow="down-left"
            openOn="click"
            modal
            content={
                <div className="shadow-md bg-white rounded-lg flex flex-col overflow-hidden">
                    <div className="h-9 px-3 hover:bg-blue-500 hover:text-white flex items-center">
                        <p className="text-sm">Download MP3</p>
                    </div>
                    <div className="h-9 px-3 hover:bg-blue-500 hover:text-white flex items-center">
                        <p className="text-sm">Transcript PDF</p>
                    </div>
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
            }
        >
            <Button
                testId="downloadButton"
                className={classNames(
                    'group flex h-8 w-8 items-center justify-center font-semibold rounded-lg',
                    'ml-2.5 shrink-0 text-gray-400 border border-gray-200 bg-white',
                    'dark:border-bluegray-5 dark:text-bluegray-4/60',
                    'hover:text-gray-500 hover:bg-gray-200 active:border-gray-400 active:bg-gray-400 active:text-white',
                    'dark:bg-bluegray-5 dark:hover:bg-bluegray-7 dark:hover:border-bluegray-7 dark:active:bg-bluegray-8 dark:active:border-bluegray-8',
                    'button__download'
                )}
                kind="primary"
            >
                <Download className="h-5 w-5 flex-shrink-0" />
            </Button>
        </Tooltip>
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
