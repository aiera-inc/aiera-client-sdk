/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
});
