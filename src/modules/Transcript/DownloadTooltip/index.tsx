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

    const attachments = event?.attachments?.filter((att) => att?.mimeType === 'application/pdf');
    const slides = attachments?.find((att) => att?.title === 'Slides')?.archivedUrl;
    const press = attachments?.find((att) => att?.title === 'Press Release')?.archivedUrl;
    const hasMP3 = !!event?.audioRecordingUrl && !!event?.audioProxy;
    const userApiKey = userQuery.state.data?.currentUser?.apiKey;
    const canDownloadTranscript = userQuery.state.data?.currentUser?.apiKey && event.connectionStatus === 'transcribed';

    if (!hasMP3 && !canDownloadTranscript && !press && !slides) {
        return <></>;
    }

    return (
        <Tooltip
            yOffset={6}
            xOffset={12}
            position="bottom-right"
            grow="down-left"
            openOn="click"
            modal
            content={
                <div className="shadow-md bg-white rounded-lg flex flex-col overflow-hidden">
                    {hasMP3 && event.audioProxy && (
                        <a
                            className="h-9 px-3 hover:bg-blue-500 hover:text-white flex items-center"
                            href={event.audioProxy}
                            target="_blank"
                            rel="noreferrer"
                            download
                        >
                            <p className="text-sm">Download MP3</p>
                        </a>
                    )}
                    {canDownloadTranscript && userApiKey && (
                        <a
                            className="h-9 px-3 hover:bg-blue-500 hover:text-white flex items-center"
                            href={
                                `https://audio` +
                                (process.env.NODE_ENV !== 'production' ? `-dev` : '') +
                                `.aiera.com/api/events/${event.id}/audio/transcript?api_key=${userApiKey}`
                            }
                            rel="noreferrer"
                            download
                        >
                            <p className="text-sm">Transcript PDF</p>
                        </a>
                    )}
                    {slides && (
                        <a
                            href={slides}
                            rel="noreferrer"
                            className="h-9 px-3 hover:bg-blue-500 hover:text-white flex items-center"
                            download
                        >
                            <p className="text-sm">Slides PDF</p>
                        </a>
                    )}
                    {press && (
                        <a
                            href={press}
                            rel="noreferrer"
                            className="h-9 px-3 hover:bg-blue-500 hover:text-white flex items-center"
                            download
                        >
                            <p className="text-sm">Press PDF</p>
                        </a>
                    )}
                </div>
            }
        >
            <Button
                testId="downloadButton"
                className={classNames(
                    'mr-3 mt-3',
                    'group flex h-8 w-8 items-center justify-center font-semibold rounded-lg',
                    'shrink-0 text-gray-400 border border-gray-200 bg-white',
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
