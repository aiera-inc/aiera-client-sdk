import classNames from 'classnames';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Loading } from '@aiera/client-sdk/modules/AieraChat/components/Messages/MessageFactory/Loading';
import { Source } from '../../store';

interface AnimatedLoadingProps {
    sources: Source[];
}

export function AnimatedLoadingStatus({ sources = [] }: AnimatedLoadingProps) {
    const [loadingText, setLoadingText] = useState('Thinking...');
    const [isVisible, setIsVisible] = useState(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const indexRef = useRef(0);

    const messages = useMemo(
        () => [
            'Thinking...',
            'Finding sources...',
            `Successfully found ${sources.length} ${sources.length === 1 ? 'source' : 'sources'}`,
            `Analyzing ${sources.length} ${sources.length === 1 ? 'source' : 'sources'}...`,
            'Reasoning...',
            'Invoking agent...',
            'Processing results...',
            'Finalizing response...',
            'Hold on to your butts!',
        ],
        [sources]
    );

    const getStatusText = (index: number): string => {
        return messages[index % messages.length] as string;
    };

    // Function to update text with animation
    const updateLoadingText = () => {
        // First fade out
        setIsVisible(false);

        // After fade out completes, update text and fade back in
        timeoutRef.current = setTimeout(() => {
            indexRef.current = (indexRef.current + 1) % messages.length;
            setLoadingText(getStatusText(indexRef.current));
            setIsVisible(true);

            // Schedule next update with random interval
            const randomInterval = Math.floor(Math.random() * 3000) + 3000; // 3-6 seconds
            timeoutRef.current = setTimeout(updateLoadingText, randomInterval);
        }, 300); // Time for fade out animation to complete
    };

    // Initialize animation cycle
    useEffect(() => {
        // Initial timeout - start updating after a random interval
        const initialInterval = Math.floor(Math.random() * 3000) + 3000;
        timeoutRef.current = setTimeout(updateLoadingText, initialInterval);

        // Cleanup on unmount
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []); // Empty dependency array - only run on mount

    // Update text if sources change and we're on source-related messages
    useEffect(() => {
        if (loadingText.includes('Found') || loadingText.includes('Analyzing')) {
            const index = loadingText.includes('Found') ? 2 : 3;
            setLoadingText(messages[index] as string);
        }
    }, [sources.length]);

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
