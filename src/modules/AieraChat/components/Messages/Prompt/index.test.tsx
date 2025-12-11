import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react';
import { Prompt } from './index';
import { MockProvider } from '@aiera/client-sdk/testUtils';
import { useChatStore } from '../../../store';
import { ChatSessionStatus } from '@aiera/client-sdk/types';
import { Config } from '@aiera/client-sdk/lib/config';

describe('Prompt', () => {
    const defaultProps = {
        onOpenSources: jest.fn(),
        onSubmit: jest.fn(),
        submitting: false,
    };

    const baseConfig = {
        assetPath: 'assets',
        platform: 'test',
        moduleName: 'AieraChat',
        gqlOptions: {
            clientOptions: {
                url: 'test',
            },
        },
    } as unknown as Config;

    beforeEach(() => {
        // Reset store to initial state before each test
        useChatStore.setState({
            chatId: 'new',
            chatStatus: ChatSessionStatus.Active,
            chatTitle: undefined,
            citationMarkers: new Map(),
            hasChanges: false,
            selectedSource: undefined,
            sources: [],
            sourceTypeCounters: new Map(),
            webSearchEnabled: false,
        });
        jest.clearAllMocks();
    });

    describe('Web Search Toggle Visibility', () => {
        test('renders web search toggle when aieraChatDisableWebSearch is not set', () => {
            const config = {
                ...baseConfig,
                options: {},
            };

            render(
                <MockProvider config={config}>
                    <Prompt {...defaultProps} />
                </MockProvider>
            );

            expect(screen.getByText('Search')).toBeInTheDocument();
        });

        test('renders web search toggle when aieraChatDisableWebSearch is false', () => {
            const config = {
                ...baseConfig,
                options: {
                    aieraChatDisableWebSearch: false,
                },
            };

            render(
                <MockProvider config={config}>
                    <Prompt {...defaultProps} />
                </MockProvider>
            );

            expect(screen.getByText('Search')).toBeInTheDocument();
        });

        test('does not render web search toggle when aieraChatDisableWebSearch is true', () => {
            const config = {
                ...baseConfig,
                options: {
                    aieraChatDisableWebSearch: true,
                },
            };

            render(
                <MockProvider config={config}>
                    <Prompt {...defaultProps} />
                </MockProvider>
            );

            expect(screen.queryByText('Search')).not.toBeInTheDocument();
        });

        test('still renders submit button when web search toggle is hidden', () => {
            const config = {
                ...baseConfig,
                options: {
                    aieraChatDisableWebSearch: true,
                },
            };

            render(
                <MockProvider config={config}>
                    <Prompt {...defaultProps} />
                </MockProvider>
            );

            // Submit button should still be present
            const submitButton = screen.getByRole('button', { name: /ask question/i });
            expect(submitButton).toBeInTheDocument();
        });
    });

    describe('Web Search Toggle Functionality', () => {
        test('toggles web search state when clicked', () => {
            const config = {
                ...baseConfig,
                options: {
                    aieraChatDisableWebSearch: false,
                },
            };

            render(
                <MockProvider config={config}>
                    <Prompt {...defaultProps} />
                </MockProvider>
            );

            const { result } = renderHook(() => useChatStore());

            // Initial state should be false
            expect(result.current.webSearchEnabled).toBe(false);

            // Click the search toggle button
            const searchButton = screen.getByText('Search').closest('button');
            expect(searchButton).not.toBeNull();

            if (searchButton) {
                act(() => {
                    fireEvent.click(searchButton);
                });

                // Web search should now be enabled
                expect(result.current.webSearchEnabled).toBe(true);

                // Click again to toggle off
                act(() => {
                    fireEvent.click(searchButton);
                });
            }

            // Web search should be disabled again
            expect(result.current.webSearchEnabled).toBe(false);
        });

        test('displays correct hint text based on web search state', () => {
            const config = {
                ...baseConfig,
                options: {
                    aieraChatDisableWebSearch: false,
                },
            };

            render(
                <MockProvider config={config}>
                    <Prompt {...defaultProps} />
                </MockProvider>
            );

            // Initially, web search is disabled
            expect(screen.getByText('Web Sources Disabled')).toBeInTheDocument();

            // Toggle web search on
            const searchButton = screen.getByText('Search').closest('button');
            expect(searchButton).not.toBeNull();

            if (searchButton) {
                act(() => {
                    fireEvent.click(searchButton);
                });

                // Hint text should update to enabled
                expect(screen.getByText('Web Sources Enabled')).toBeInTheDocument();
            }
        });

        test('applies correct styling when web search is enabled', () => {
            const config = {
                ...baseConfig,
                options: {
                    aieraChatDisableWebSearch: false,
                },
            };

            render(
                <MockProvider config={config}>
                    <Prompt {...defaultProps} />
                </MockProvider>
            );

            const searchButton = screen.getByText('Search').closest('button');
            expect(searchButton).not.toBeNull();

            if (searchButton) {
                expect(searchButton).toHaveClass('text-slate-400', 'bg-slate-100');

                // Toggle web search on
                act(() => {
                    fireEvent.click(searchButton);
                });

                // Should have rose/red styling when enabled
                expect(searchButton).toHaveClass('text-rose-600', 'bg-rose-100');
            }
        });
    });

    describe('Input and Submit Functionality', () => {
        test('renders input field and placeholder', () => {
            render(
                <MockProvider config={baseConfig}>
                    <Prompt {...defaultProps} />
                </MockProvider>
            );

            expect(screen.getByText('Type your questions here...')).toBeInTheDocument();
        });

        test('submit button is disabled when submitting', () => {
            render(
                <MockProvider config={baseConfig}>
                    <Prompt {...defaultProps} submitting={true} />
                </MockProvider>
            );

            const submitButton = screen.getByRole('button', { name: /ask question/i });
            expect(submitButton).toBeDisabled();
        });

        test('submit button is disabled when chat is not active', () => {
            useChatStore.setState({
                chatStatus: ChatSessionStatus.GeneratingResponse,
            });

            render(
                <MockProvider config={baseConfig}>
                    <Prompt {...defaultProps} />
                </MockProvider>
            );

            const submitButton = screen.getByRole('button', { name: /ask question/i });
            expect(submitButton).toBeDisabled();
        });
    });

    describe('Configuration Combinations', () => {
        test('works with other config options when web search is disabled', () => {
            const config = {
                ...baseConfig,
                options: {
                    aieraChatDisableWebSearch: true,
                    isMobile: true,
                    darkMode: false,
                },
            };

            render(
                <MockProvider config={config}>
                    <Prompt {...defaultProps} />
                </MockProvider>
            );

            expect(screen.queryByText('Search')).not.toBeInTheDocument();
            expect(screen.getByText('Type your questions here...')).toBeInTheDocument();
        });

        test('works with other config options when web search is enabled', () => {
            const config = {
                ...baseConfig,
                options: {
                    aieraChatDisableWebSearch: false,
                    isMobile: false,
                    darkMode: true,
                },
            };

            render(
                <MockProvider config={config}>
                    <Prompt {...defaultProps} />
                </MockProvider>
            );

            expect(screen.getByText('Search')).toBeInTheDocument();
            expect(screen.getByText('Type your questions here...')).toBeInTheDocument();
        });
    });
});
