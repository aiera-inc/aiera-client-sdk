import React, { Fragment, MouseEventHandler, ReactElement, SyntheticEvent, useCallback } from 'react';
import gql from 'graphql-tag';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';

import { QueryResult, useQuery } from '@aiera/client-sdk/api/client';
import { Button } from '@aiera/client-sdk/components/Button';
import { Input } from '@aiera/client-sdk/components/Input';
import { MagnifyingGlass } from '@aiera/client-sdk/components/Svg/MagnifyingGlass';
import { Playbar } from '@aiera/client-sdk/components/Playbar';
import { Plus } from '@aiera/client-sdk/components/Svg/Plus';
import { Tooltip } from '@aiera/client-sdk/components/Tooltip';
import { ChangeHandler, useChangeHandlers } from '@aiera/client-sdk/lib/hooks/useChangeHandlers';
import { prettyLineBreak } from '@aiera/client-sdk/lib/strings';
import { PlayButton } from '@aiera/client-sdk/modules/EventList/PlayButton'; // TODO this should probably be a component
import { RecordingForm } from '@aiera/client-sdk/modules/RecordingForm';
import { RecordingListQuery, RecordingListQueryVariables, User } from '@aiera/client-sdk/types/generated';
import './styles.css';

interface RecordingListSharedProps {}

type CustomEvent = RecordingListQuery['customEvents'][0];

/** @notExported */
interface RecordingListUIProps extends RecordingListSharedProps {
    onSearchChange: ChangeHandler<string>;
    recordingsQuery: QueryResult<RecordingListQuery, RecordingListQueryVariables>;
    searchTerm: string;
    showForm: boolean;
    toggleForm: MouseEventHandler;
}

export function RecordingListUI(props: RecordingListUIProps): ReactElement {
    const { onSearchChange, recordingsQuery, searchTerm, showForm, toggleForm } = props;
    if (showForm) {
        return <RecordingForm onBack={toggleForm} />;
    }
    const wrapMsg = (msg: string) => <div className="flex flex-1 items-center justify-center text-gray-600">{msg}</div>;
    let prevEventDate: DateTime | null = null;
    return (
        <div className="h-full flex flex-col recordinglist">
            <div className="flex flex-col pt-3 pl-3 pr-3 shadow-3xl dark:shadow-3xl-dark dark:bg-bluegray-6 recordinglist__header">
                <div className="flex items-center mb-3">
                    <Input
                        icon={<MagnifyingGlass />}
                        name="search"
                        onChange={onSearchChange}
                        placeholder="Search Recordings..."
                        value={searchTerm}
                    />
                    <Button
                        className="bg-blue-500 cursor-pointer flex flex-shrink-0 items-center ml-2 rounded-0.375 active:bg-blue-700 hover:bg-blue-600"
                        onClick={toggleForm}
                    >
                        <Plus className="h-4 mb-0.5 text-white w-2.5" />
                        <span className="font-light ml-1.5 text-sm text-white">Schedule Recording</span>
                    </Button>
                </div>
            </div>
            <div className="flex flex-col flex-1 pb-2 pt-0 overflow-y-scroll dark:bg-bluegray-7">
                <div className="flex flex-col flex-grow">
                    <div className="flex flex-col items-center justify-center flex-1">
                        {match(recordingsQuery)
                            .with({ status: 'loading' }, () => (
                                <ul className="w-full RecordingList__loading">
                                    {new Array(15).fill(0).map((_, idx) => (
                                        <li key={idx} className="p-2 animate-pulse mx-2">
                                            <div className="flex items-center">
                                                <div className="rounded-full bg-gray-300 dark:bg-bluegray-5 w-9 h-9" />
                                                <div className="flex flex-col flex-1 min-w-0 p-2 pr-4">
                                                    <div className="flex">
                                                        <div className="rounded-full bg-gray-500 dark:bg-bluegray-5 h-[10px] mr-2 w-7" />
                                                        <div className="rounded-full bg-gray-400 dark:bg-bluegray-6 h-[10px] mr-2 w-12" />
                                                    </div>
                                                    <div className="flex">
                                                        <div className="rounded-full bg-gray-300 dark:bg-bluegray-5 h-[10px] mr-2 w-28 mt-2" />
                                                        <div className="rounded-full bg-gray-200 dark:bg-bluegray-6 h-[10px] mr-2 w-16 mt-2" />
                                                        <div className="rounded-full bg-gray-200 dark:bg-bluegray-6 h-[10px] mr-2 w-10 mt-2" />
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ))
                            .with({ status: 'paused' }, () => wrapMsg('There are no recordings.'))
                            .with({ status: 'error' }, () => wrapMsg('There was an error loading recordings.'))
                            .with({ status: 'empty' }, () => wrapMsg('There are no recordings.'))
                            .with({ status: 'success' }, ({ data: { customEvents } }) => (
                                <ul className="w-full">
                                    {customEvents.map((event: CustomEvent) => {
                                        const eventDate = DateTime.fromISO(event.eventDate);
                                        const audioOffset = (event.audioRecordingOffsetMs ?? 0) / 1000;
                                        let createdBy = '';
                                        if (event.creator) {
                                            const creator = event.creator as User;
                                            if (creator.firstName) {
                                                createdBy = creator.firstName;
                                            }
                                            if (creator.lastName) {
                                                createdBy = `${createdBy} ${creator.lastName.slice(0, 1)}.`;
                                            }
                                            if (!createdBy) {
                                                createdBy = creator.primaryEmail || creator.username;
                                            }
                                        }
                                        let divider = null;
                                        if (
                                            !prevEventDate ||
                                            prevEventDate.toFormat('MM/dd/yyyy') !== eventDate.toFormat('MM/dd/yyyy')
                                        ) {
                                            prevEventDate = eventDate;
                                            divider = (
                                                <li className="sticky top-[8px] px-3 first-of-type:pb-2">
                                                    <div className="px-1 py-2 backdrop-filter backdrop-blur-sm bg-white bg-opacity-70 flex rounded-lg items-center text-sm whitespace-nowrap text-gray-500 font-semibold dark:bg-bluegray-7 dark:bg-opacity-70">
                                                        {eventDate.toFormat('DDDD')}
                                                        <div className="ml-2 w-full flex h-[1px] bg-gradient-to-r from-gray-200 dark:from-bluegray-5"></div>
                                                    </div>
                                                </li>
                                            );
                                        }
                                        return (
                                            <Fragment key={event.id}>
                                                {divider}
                                                <li
                                                    tabIndex={0}
                                                    className="group h-12 text-xs text-gray-300 mx-1 rounded-lg px-2 cursor-pointer hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-bluegray-6 dark:active:bg-bluegray-5"
                                                >
                                                    <Tooltip
                                                        className="h-12 flex flex-row"
                                                        content={
                                                            <div className="max-w-[300px] bg-black bg-opacity-80 dark:bg-bluegray-4 px-1.5 py-0.5 rounded text-white dark:text-bluegray-7 ml-9">
                                                                {prettyLineBreak(event.title)}
                                                            </div>
                                                        }
                                                        grow="up-right"
                                                        openOn="hover"
                                                        position="top-left"
                                                        yOffset={4}
                                                        hideOnDocumentScroll
                                                    >
                                                        <div className="flex items-center justify-center">
                                                            <div className="flex items-center justify-center w-8 h-8">
                                                                <PlayButton
                                                                    metaData={{ eventType: event.eventType }}
                                                                    id={event.id}
                                                                    url={
                                                                        event.isLive
                                                                            ? `https://storage.media.aiera.com/${event.id}`
                                                                            : event.audioRecordingUrl
                                                                    }
                                                                    offset={audioOffset || 0}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col justify-center flex-1 min-w-0 pl-2 pr-4">
                                                            <div className="flex items-end">
                                                                <span className="leading-none text-sm text-black dark:text-white truncate font-bold">
                                                                    {event.title}
                                                                </span>
                                                            </div>
                                                            <div className="leading-none flex text-sm capitalize items-center mt-1 text-black dark:text-white">
                                                                {createdBy}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col justify-center items-end">
                                                            {event.isLive ? (
                                                                <div className="text-xs leading-none flex justify-center items-center text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-bluegray-6 rounded px-1 pt-0.5 pb-[3px] mb-0.5 group-hover:bg-red-500 group-hover:text-white">
                                                                    {`Live • ${eventDate.toFormat('h:mma')}`}
                                                                </div>
                                                            ) : (
                                                                <div className="leading-none text-gray-500 group-hover:text-black dark:group-hover:text-gray-300">
                                                                    {eventDate.toFormat('h:mma')}
                                                                </div>
                                                            )}
                                                            <div className="leading-none mt-1 text-gray-300 group-hover:text-gray-500">
                                                                {eventDate.toFormat('MMM dd, yyyy')}
                                                            </div>
                                                        </div>
                                                    </Tooltip>
                                                </li>
                                            </Fragment>
                                        );
                                    })}
                                </ul>
                            ))
                            .exhaustive()}
                        <div className="flex-1" />
                    </div>
                </div>
            </div>
            <Playbar />
        </div>
    );
}

/** @notExported */
export interface RecordingListProps extends RecordingListSharedProps {}

interface RecordingListState {
    searchTerm: string;
    showForm: boolean;
}

/**
 * Renders RecordingList
 */
export function RecordingList(_props: RecordingListProps): ReactElement {
    const { handlers, state } = useChangeHandlers<RecordingListState>({
        searchTerm: '',
        showForm: false,
    });

    const recordingsQuery = useQuery<RecordingListQuery, RecordingListQueryVariables>({
        isEmpty: ({ customEvents }) => customEvents.length === 0,
        requestPolicy: 'cache-and-network',
        query: gql`
            query RecordingList($filter: CustomEventsFilter) {
                customEvents(filter: $filter) {
                    id
                    audioRecordingOffsetMs
                    audioRecordingUrl
                    creator {
                        id
                        firstName
                        lastName
                        primaryEmail
                        username
                    }
                    eventDate
                    eventType
                    isLive
                    primaryCompany {
                        id
                        commonName
                        instruments {
                            id
                            isPrimary
                            quotes {
                                id
                                isPrimary
                                localTicker
                                exchange {
                                    id
                                    shortName
                                    country {
                                        id
                                        countryCode
                                    }
                                }
                            }
                        }
                    }
                    title
                }
            }
        `,
        variables: {
            filter: {
                title: state.searchTerm || undefined,
            },
        },
    });

    return (
        <RecordingListUI
            onSearchChange={handlers.searchTerm}
            recordingsQuery={recordingsQuery}
            searchTerm={state.searchTerm}
            showForm={state.showForm}
            toggleForm={useCallback(
                (event: SyntheticEvent<Element, Event>) => handlers.showForm(event, { value: !state.showForm }),
                [state.showForm]
            )}
        />
    );
}
