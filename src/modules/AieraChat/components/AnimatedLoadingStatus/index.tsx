import classNames from 'classnames';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Loading } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Loading';
import { Source } from '../../store';

interface AnimatedLoadingProps {
    sources: Source[];
}

// Define an interface for message configuration
interface StatusMessage {
    text: string;
    durationMs: number | [number, number]; // Fixed duration or [min, max] for random range
}

export function AnimatedLoadingStatus({ sources = [] }: AnimatedLoadingProps) {
    const [loadingText, setLoadingText] = useState('Thinking...');
    const [isVisible, setIsVisible] = useState(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const indexRef = useRef(0);

    // Define messages with custom durations
    const messages = useMemo(
        (): StatusMessage[] => [
            { text: 'Thinking...', durationMs: [3000, 5000] }, // Random between 3-5 seconds
            { text: 'Finding sources...', durationMs: [2000, 3000] }, // Random between 2-4 seconds
            {
                text: `Successfully found ${sources.length} ${sources.length === 1 ? 'source' : 'sources'}`,
                durationMs: 1000, // Fixed at 1 second - shorter duration
            },
            {
                text: `Analyzing ${sources.length} ${sources.length === 1 ? 'source' : 'sources'}...`,
                durationMs: [4000, 6000],
            },
            { text: 'Reasoning...', durationMs: [3000, 5000] },
            { text: 'Invoking agent...', durationMs: [2000, 4000] },
            { text: 'Processing results...', durationMs: [3000, 4000] },
            { text: 'Finalizing response...', durationMs: [6000, 10000] },
            { text: 'Still working...', durationMs: 10000 }, // duration doesn't matter for the last message
        ],
        [sources]
    );

    // Function to get the message text at a specific index
    const getMessageText = (index: number): string => {
        return index < messages.length ? messages[index]?.text || '' : messages[messages.length - 1]?.text || '';
    };

    // Function to get the duration for a message at a specific index
    const getMessageDuration = (index: number): number => {
        // If we're at or beyond the last message, return 0 to stop cycling
        if (index >= messages.length - 1) {
            return 0;
        }

        const durationSetting = messages[index]?.durationMs || 0;

        if (Array.isArray(durationSetting)) {
            // If duration is a range [min, max], generate a random duration within that range
            const [min, max] = durationSetting;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        } else {
            // If duration is a fixed number, return it directly
            return durationSetting;
        }
    };

    // Function to update text with animation
    const updateLoadingText = () => {
        // First fade out
        setIsVisible(false);

        // After fade out completes, update text and fade back in
        timeoutRef.current = setTimeout(() => {
            // Move to next message index
            indexRef.current += 1;

            // Set the new text
            setLoadingText(getMessageText(indexRef.current));
            setIsVisible(true);

            // Schedule next update using the custom duration for the current message
            const nextDuration = getMessageDuration(indexRef.current);

            // Only schedule next update if we haven't reached the last message
            if (nextDuration > 0) {
                timeoutRef.current = setTimeout(updateLoadingText, nextDuration);
            }
        }, 300); // Time for fade out animation to complete
    };

    // Initialize animation cycle
    useEffect(() => {
        // Initial timeout - start updating after the duration for the first message
        const initialDuration = getMessageDuration(0);
        timeoutRef.current = setTimeout(updateLoadingText, initialDuration);

        // Cleanup on unmount
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <Loading>
            <span
                className={classNames('transition-opacity duration-300', {
                    'opacity-100': isVisible,
                    'opacity-0': !isVisible,
                })}
            >
                {loadingText}
            </span>
        </Loading>
    );
}
