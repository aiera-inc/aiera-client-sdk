import { Button } from '@aiera/client-sdk/components/Button';
import { Textarea } from '@aiera/client-sdk/components/Textarea';
import { useConfig } from '@aiera/client-sdk/lib/config';
import { useMessageBus } from '@aiera/client-sdk/lib/msg';
import { ChangeHandler } from '@aiera/client-sdk/types';
import {
    ReportEventIssueInput,
    ReportEventIssueMutation,
    ReportEventIssueMutationVariables,
} from '@aiera/client-sdk/types/generated';
import gql from 'graphql-tag';
import React, { ReactElement, useCallback, useState } from 'react';
import { useMutation } from 'urql';
import './styles.css';

interface ReportIssueSharedProps {
    onToggle: (override?: boolean) => void;
}

/** @notExported */
interface ReportIssueUIProps extends ReportIssueSharedProps {
    onSubmit: () => void;
    issueText: string;
    submitState: string;
    onChangeIssue: ChangeHandler<string>;
}

export function ReportIssueUI(props: ReportIssueUIProps): ReactElement {
    const { onToggle, onSubmit, onChangeIssue, submitState, issueText } = props;
    return (
        <div
            id="reportIssueContainer"
            className="absolute z-50 inset-0 bg-gray-900/20 dark:opacity-60 flex items-center justify-center flex-col"
            onClick={() => onToggle(false)}
        >
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
                className="w-full max-w-[18rem] px-4 py-3 bg-white shadow-md rounded-lg flex flex-col"
            >
                <p className="text-sm font-semibold antialiased">Report Event Issue</p>
                <p className="mb-2 text-slate-500 text-xs antialiased">Our team will be notified immediately.</p>
                <Textarea
                    placeholder="Please enter a description of the issue..."
                    clearable={false}
                    value={issueText}
                    name={'issue'}
                    onChange={onChangeIssue}
                />
                {submitState === 'loading' ? (
                    <div className="flex items-center mt-2">
                        <Button kind="primary" className="flex-1 justify-center">
                            Loading...
                        </Button>
                        <Button className="ml-2" kind="secondary" onClick={() => onToggle(false)}>
                            Cancel
                        </Button>
                    </div>
                ) : submitState === 'success' ? (
                    <div className="flex items-center mt-2">
                        <Button kind="primary" className="flex-1 justify-center">
                            Success!
                        </Button>
                        <Button className="ml-2" kind="secondary" onClick={() => onToggle(false)}>
                            Cancel
                        </Button>
                    </div>
                ) : submitState === 'error' ? (
                    <div className="mt-2 text-center text-sm">Error...</div>
                ) : (
                    <div className="flex items-center mt-2">
                        <Button kind="primary" className="flex-1 justify-center" onClick={onSubmit}>
                            Report Issue
                        </Button>
                        <Button className="ml-2" kind="secondary" onClick={() => onToggle(false)}>
                            Cancel
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

/** @notExported */
export interface ReportIssueProps extends ReportIssueSharedProps {
    eventId: string;
}

/**
 * Renders EventDetails
 */
export function ReportIssue(props: ReportIssueProps): ReactElement {
    const { eventId, onToggle } = props;
    const config = useConfig();
    const [submitState, setSubmitState] = useState<string>('');
    const [issue, setIssue] = useState<string>('');
    const onChangeIssue: ChangeHandler<string> = useCallback((_, { value }) => {
        if (typeof value === 'string') {
            setIssue(value);
        }
    }, []);
    const [__, reportEventIssueMutation] = useMutation<ReportEventIssueMutation, ReportEventIssueMutationVariables>(gql`
        mutation ReportEventIssue($input: ReportEventIssueInput!) {
            reportEventIssue(input: $input) {
                success
            }
        }
    `);
    const bus = useMessageBus();
    const trackingId = config?.tracking?.userId;
    const userEmail = config?.user?.email;
    const userInfo = trackingId || userEmail;
    const reportEventIssue = useCallback(async () => {
        setSubmitState('loading');
        bus.emit('issue-reported', { issue, eventId, user: trackingId || userEmail }, 'out');
        return reportEventIssueMutation({
            input: {
                eventId,
                issue: typeof userInfo === 'string' ? `User: ${userInfo} | ${issue}` : issue,
            } as ReportEventIssueInput,
        })
            .then((resp) => {
                if (resp.data?.reportEventIssue?.success) {
                    setSubmitState('success');
                    setTimeout(() => {
                        setSubmitState('');
                        setIssue('');
                    }, 5000);
                } else {
                    throw new Error('Error reporting issue');
                }
            })
            .catch((_e) => {
                setSubmitState('error');
                setTimeout(() => {
                    setSubmitState('');
                }, 5000);
            });
    }, [reportEventIssueMutation, eventId, setSubmitState, issue, trackingId]);

    return (
        <ReportIssueUI
            issueText={issue}
            submitState={submitState}
            onChangeIssue={onChangeIssue}
            onToggle={onToggle}
            onSubmit={reportEventIssue}
        />
    );
}
