/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Tooltip, TooltipProps } from '.';

const targetContent = 'Tooltip Target';
const tooltipContent = 'Tooltip Content';
const containerContent = 'container';

function renderTooltip(props: TooltipProps) {
    return render(
        <div>
            <div>{containerContent}</div>
            <Tooltip {...props} />
        </div>
    );
}

describe('Tooltip', () => {
    test('renders tooltip on hover', async () => {
        renderTooltip({
            closeOn: 'hover',
            children: targetContent,
            content: tooltipContent,
            openOn: 'hover',
        });

        userEvent.hover(screen.getByText(targetContent));
        await waitFor(() => screen.getByText(tooltipContent));
        userEvent.unhover(screen.getByText(targetContent));
        await waitFor(() => expect(screen.queryByText(tooltipContent)).toBeNull());
    });

    test('renders tooltip on click', async () => {
        renderTooltip({
            closeOn: 'click',
            children: targetContent,
            content: tooltipContent,
            openOn: 'click',
        });

        userEvent.click(screen.getByText(targetContent));
        await waitFor(() => screen.getByText(tooltipContent));
        userEvent.click(screen.getByText(containerContent));
        await waitFor(() => expect(screen.queryByText(tooltipContent)).toBeNull());
    });

    test('persists tooltip with closeOn = null', async () => {
        renderTooltip({
            children: targetContent,
            closeOn: null,
            content: tooltipContent,
            openOn: 'click',
        });

        userEvent.click(screen.getByText(targetContent));
        await waitFor(() => screen.getByText(tooltipContent));
        userEvent.click(screen.getByText(containerContent));
        screen.getByText(tooltipContent);
        await waitFor(() => expect(screen.queryByText(tooltipContent)));
    });

    test('delays tooltip show/hide', () => {
        jest.useFakeTimers();

        renderTooltip({
            children: targetContent,
            content: tooltipContent,
            openDelay: 500,
            closeDelay: 500,
        });

        // Hover and make sure it doesnt show at 250ms
        userEvent.hover(screen.getByText(targetContent));
        act(() => {
            jest.advanceTimersByTime(250);
        });
        expect(screen.queryByText(tooltipContent)).toBeNull();
        // Make sure it is showing at 500ms
        act(() => {
            jest.advanceTimersByTime(250);
        });
        screen.getByText(tooltipContent);

        // Unhover and make sure it's still showing after 150ms
        userEvent.unhover(screen.getByText(targetContent));
        act(() => {
            jest.advanceTimersByTime(250);
        });
        screen.getByText(tooltipContent);

        // Make sure it's no longer showing after 500ms
        act(() => {
            jest.advanceTimersByTime(250);
        });
        expect(screen.queryByText(tooltipContent)).toBeNull();

        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    test('delays for show/hide are properly cancelled', () => {
        jest.useFakeTimers();

        renderTooltip({
            children: targetContent,
            content: tooltipContent,
            openDelay: 500,
            closeDelay: 500,
        });

        // Hover and then unhover should cancel it
        userEvent.hover(screen.getByText(targetContent));
        act(() => {
            jest.advanceTimersByTime(250);
        });
        userEvent.unhover(screen.getByText(targetContent));
        act(() => {
            jest.advanceTimersByTime(250);
        });
        expect(screen.queryByText(tooltipContent)).toBeNull();

        act(() => {
            jest.runOnlyPendingTimers();
        });

        // Get the tooltip showing, unhover and hover again should keep it up
        userEvent.hover(screen.getByText(targetContent));
        act(() => {
            jest.advanceTimersByTime(500);
        });
        screen.getByText(tooltipContent);
        userEvent.unhover(screen.getByText(targetContent));
        act(() => {
            jest.advanceTimersByTime(250);
        });
        userEvent.hover(screen.getByText(targetContent));
        act(() => {
            jest.advanceTimersByTime(250);
        });
        screen.queryByText(tooltipContent);

        jest.useRealTimers();
    });

    // default window.innerWidth = 1024
    // default window.innerHeight = 768
    const innerWidth = 1024;
    const innerHeight = 768;
    const xOffset = 10;
    const yOffset = 20;
    const targetBoundingRect = {
        x: 100,
        left: 100,
        y: 200,
        top: 200,
        width: 50,
        height: 75,
        right: 100 + 50,
        bottom: 200 + 75,
    };

    [
        {
            position: 'top-left',
            targetBoundingRect,
            xOffset,
            yOffset,
            growthTypes: [
                {
                    grow: 'down-right',
                    expectedPosition: {
                        top: `${targetBoundingRect.top + yOffset}px`,
                        left: `${targetBoundingRect.left + xOffset}px`,
                    },
                },
                {
                    grow: 'up-right',
                    expectedPosition: {
                        bottom: `${innerHeight - targetBoundingRect.top + yOffset}px`,
                        left: `${targetBoundingRect.left + xOffset}px`,
                    },
                },
                {
                    grow: 'down-left',
                    expectedPosition: {
                        top: `${targetBoundingRect.top + yOffset}px`,
                        right: `${innerWidth - targetBoundingRect.left + xOffset}px`,
                    },
                },
                {
                    grow: 'up-left',
                    expectedPosition: {
                        bottom: `${innerHeight - targetBoundingRect.top + yOffset}px`,
                        right: `${innerWidth - targetBoundingRect.left + xOffset}px`,
                    },
                },
            ],
        },
        {
            position: 'bottom-left',
            targetBoundingRect,
            xOffset,
            yOffset,
            growthTypes: [
                {
                    grow: 'down-right',
                    expectedPosition: {
                        top: `${targetBoundingRect.bottom + yOffset}px`,
                        left: `${targetBoundingRect.left + xOffset}px`,
                    },
                },
                {
                    grow: 'up-right',
                    expectedPosition: {
                        bottom: `${innerHeight - targetBoundingRect.bottom + yOffset}px`,
                        left: `${targetBoundingRect.left + xOffset}px`,
                    },
                },
                {
                    grow: 'down-left',
                    expectedPosition: {
                        top: `${targetBoundingRect.bottom + yOffset}px`,
                        right: `${innerWidth - targetBoundingRect.left + xOffset}px`,
                    },
                },
                {
                    grow: 'up-left',
                    expectedPosition: {
                        bottom: `${innerHeight - targetBoundingRect.bottom + yOffset}px`,
                        right: `${innerWidth - targetBoundingRect.left + xOffset}px`,
                    },
                },
            ],
        },
        {
            position: 'top-right',
            targetBoundingRect,
            xOffset,
            yOffset,
            growthTypes: [
                {
                    grow: 'down-right',
                    expectedPosition: {
                        top: `${targetBoundingRect.top + yOffset}px`,
                        left: `${targetBoundingRect.right + xOffset}px`,
                    },
                },
                {
                    grow: 'up-right',
                    expectedPosition: {
                        bottom: `${innerHeight - targetBoundingRect.top + yOffset}px`,
                        left: `${targetBoundingRect.right + xOffset}px`,
                    },
                },
                {
                    grow: 'down-left',
                    expectedPosition: {
                        top: `${targetBoundingRect.top + yOffset}px`,
                        right: `${innerWidth - targetBoundingRect.right + xOffset}px`,
                    },
                },
                {
                    grow: 'up-left',
                    expectedPosition: {
                        bottom: `${innerHeight - targetBoundingRect.top + yOffset}px`,
                        right: `${innerWidth - targetBoundingRect.right + xOffset}px`,
                    },
                },
            ],
        },
        {
            position: 'bottom-right',
            targetBoundingRect,
            xOffset,
            yOffset,
            growthTypes: [
                {
                    grow: 'down-right',
                    expectedPosition: {
                        top: `${targetBoundingRect.bottom + yOffset}px`,
                        left: `${targetBoundingRect.right + xOffset}px`,
                    },
                },
                {
                    grow: 'up-right',
                    expectedPosition: {
                        bottom: `${innerHeight - targetBoundingRect.bottom + yOffset}px`,
                        left: `${targetBoundingRect.right + xOffset}px`,
                    },
                },
                {
                    grow: 'down-left',
                    expectedPosition: {
                        top: `${targetBoundingRect.bottom + yOffset}px`,
                        right: `${innerWidth - targetBoundingRect.right + xOffset}px`,
                    },
                },
                {
                    grow: 'up-left',
                    expectedPosition: {
                        bottom: `${innerHeight - targetBoundingRect.bottom + yOffset}px`,
                        right: `${innerWidth - targetBoundingRect.right + xOffset}px`,
                    },
                },
            ],
        },
    ].forEach((testCase) => {
        testCase.growthTypes.forEach((growthType) => {
            test(`Positions correctly when 'position="${testCase.position}"' and 'grow="${growthType.grow}"'`, async () => {
                renderTooltip({
                    children: targetContent,
                    content: tooltipContent,
                    openOn: 'click',
                    position: testCase.position as TooltipProps['position'],
                    grow: growthType.grow as TooltipProps['grow'],
                    xOffset: testCase.xOffset,
                    yOffset: testCase.yOffset,
                });

                const target = screen.getByText(targetContent);
                // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
                target.getBoundingClientRect = jest.fn(() => targetBoundingRect);
                userEvent.click(target);
                const tooltip = await waitFor(() => screen.getByText(tooltipContent));
                expect(tooltip).toHaveStyle(growthType.expectedPosition);
            });
        });
    });

    test('matches target width when matchWidth=true', async () => {
        renderTooltip({
            children: targetContent,
            content: tooltipContent,
            openOn: 'click',
            position: 'bottom-left',
            matchWidth: true,
        });

        const target = screen.getByText(targetContent);
        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        target.getBoundingClientRect = jest.fn(() => targetBoundingRect);
        userEvent.click(target);
        const tooltip = await waitFor(() => screen.getByText(tooltipContent));
        expect(tooltip).toHaveStyle({ width: '50px' });
    });

    test('puts up a modal to block the background if modal is true', async () => {
        const { container } = renderTooltip({
            children: targetContent,
            content: tooltipContent,
            openOn: 'click',
            position: 'bottom-left',
            modal: true,
        });

        const target = screen.getByText(targetContent);
        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        userEvent.click(target);
        await waitFor(() => screen.getByText(tooltipContent));
        expect(container.querySelector('.tooltip__modal')).toBeTruthy();
    });

    test('skips modal if modal is false', async () => {
        const { container } = renderTooltip({
            children: targetContent,
            content: tooltipContent,
            openOn: 'click',
            position: 'bottom-left',
            modal: false,
        });

        const target = screen.getByText(targetContent);
        // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
        userEvent.click(target);
        await waitFor(() => screen.getByText(tooltipContent));
        expect(container.querySelector('.tooltip__modal')).toBeFalsy();
    });

    test('hides tooltip on scroll if hideOnDocumentScroll is true', async () => {
        renderTooltip({
            children: targetContent,
            content: tooltipContent,
            openOn: 'hover',
            position: 'top-left',
            grow: 'up-right',
            modal: false,
            hideOnDocumentScroll: true,
        });

        const target = screen.getByText(targetContent);
        userEvent.hover(target);
        await waitFor(() => screen.getByText(tooltipContent));
        fireEvent.scroll(document);
        await waitFor(() => expect(screen.queryByText(tooltipContent)).toBeNull());
    });

    test('does not hide tooltip on scroll if hideOnDocumentScroll is false', async () => {
        renderTooltip({
            children: targetContent,
            content: tooltipContent,
            openOn: 'hover',
            position: 'top-left',
            grow: 'up-right',
            modal: false,
            hideOnDocumentScroll: false,
        });

        const target = screen.getByText(targetContent);
        userEvent.hover(target);
        await waitFor(() => screen.getByText(tooltipContent));
        fireEvent.scroll(document);
        await waitFor(() => expect(screen.queryByText(tooltipContent)).toBeTruthy());
    });

    test('calls onOpen after tooltip opens', async () => {
        const onOpen = jest.fn();
        renderTooltip({
            children: targetContent,
            content: tooltipContent,
            openOn: 'hover',
            onOpen,
            position: 'top-left',
            grow: 'up-right',
            modal: false,
            hideOnDocumentScroll: true,
        });

        const target = screen.getByText(targetContent);
        userEvent.hover(target);
        await waitFor(() => screen.getByText(tooltipContent));
        expect(onOpen).toHaveBeenCalledTimes(1);
    });

    test('calls onClose after tooltip hides', async () => {
        const onClose = jest.fn();
        renderTooltip({
            children: targetContent,
            content: tooltipContent,
            openOn: 'hover',
            onClose,
            position: 'top-left',
            grow: 'up-right',
            modal: false,
            hideOnDocumentScroll: true,
        });

        const target = screen.getByText(targetContent);
        userEvent.hover(target);
        await waitFor(() => screen.getByText(tooltipContent));
        fireEvent.scroll(document);
        await waitFor(() => expect(screen.queryByText(tooltipContent)).toBeNull());
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('hides tooltip on ESC keydown event', async () => {
        renderTooltip({
            children: targetContent,
            content: tooltipContent,
            openOn: 'hover',
            position: 'top-left',
            grow: 'up-right',
            modal: false,
            hideOnDocumentScroll: true,
        });

        const target = screen.getByText(targetContent);
        userEvent.hover(target);
        await waitFor(() => screen.getByText(tooltipContent));
        fireEvent.keyDown(window, { key: 'Escape' });
        await waitFor(() => expect(screen.queryByText(tooltipContent)).toBeNull());
    });
});
