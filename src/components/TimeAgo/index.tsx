import React, { ReactElement } from 'react';
import { TDate } from 'timeago.js';
import { useTimeAgo } from '@aiera/client-sdk/lib/hooks/useTimeAgo';
import './styles.css';

interface TimeAgoSharedProps {
    className?: string;
}

/** @notExported */
interface TimeAgoUIProps extends TimeAgoSharedProps {
    timeAgo: TDate;
}

export function TimeAgoUI(props: TimeAgoUIProps): ReactElement {
    const { className, timeAgo } = props;
    if (typeof timeAgo === 'string') {
        return <div className={className}>{timeAgo}</div>;
    }

    return <></>;
}

/** @notExported */
export interface TimeAgoProps extends TimeAgoSharedProps {
    date: TDate;
    realtime?: boolean;
}

/**
 * Renders TimeAgo
 */
export function TimeAgo(props: TimeAgoProps): ReactElement {
    const { className, date, realtime } = props;
    return <TimeAgoUI className={className} timeAgo={useTimeAgo(date, realtime)} />;
}
