/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { render, screen } from '@testing-library/react';
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
    test('renders tooltip on hover', () => {
        renderTooltip({
            closeOn: 'hover',
            children: targetContent,
            content: tooltipContent,
            openOn: 'hover',
        });

        userEvent.hover(screen.getByText(targetContent));
        screen.getByText(tooltipContent);
        userEvent.unhover(screen.getByText(targetContent));
        expect(screen.queryByText(tooltipContent)).toBeNull();
    });

    test('renders tooltip on click', () => {
        renderTooltip({
            closeOn: 'click',
            children: targetContent,
            content: tooltipContent,
            openOn: 'click',
        });

        userEvent.click(screen.getByText(targetContent));
        screen.getByText(tooltipContent);
        userEvent.click(screen.getByText(containerContent));
        expect(screen.queryByText(tooltipContent)).toBeNull();
    });

    test('persists tooltip with closeOn = null', () => {
        renderTooltip({
            children: targetContent,
            closeOn: null,
            content: tooltipContent,
            openOn: 'click',
        });

        userEvent.click(screen.getByText(targetContent));
        screen.getByText(tooltipContent);
        userEvent.click(screen.getByText(containerContent));
        screen.getByText(tooltipContent);
    });

    // default window.innerWidth = 1024
    // default window.innerHeight = 768
    const innerWidth = 1024;
    const innerHeight = 768;
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
            growthTypes: [
                {
                    grow: 'down-right',
                    expectedPosition: {
                        top: `${targetBoundingRect.top}px`,
                        left: `${targetBoundingRect.left}px`,
                    },
                },
                {
                    grow: 'up-right',
                    expectedPosition: {
                        bottom: `${innerHeight - targetBoundingRect.top}px`,
                        left: `${targetBoundingRect.left}px`,
                    },
                },
                {
                    grow: 'down-left',
                    expectedPosition: {
                        top: `${targetBoundingRect.top}px`,
                        right: `${innerWidth - targetBoundingRect.left}px`,
                    },
                },
                {
                    grow: 'up-left',
                    expectedPosition: {
                        bottom: `${innerHeight - targetBoundingRect.top}px`,
                        right: `${innerWidth - targetBoundingRect.left}px`,
                    },
                },
            ],
        },
        {
            position: 'bottom-left',
            targetBoundingRect,
            growthTypes: [
                {
                    grow: 'down-right',
                    expectedPosition: {
                        top: `${targetBoundingRect.bottom}px`,
                        left: `${targetBoundingRect.left}px`,
                    },
                },
                {
                    grow: 'up-right',
                    expectedPosition: {
                        bottom: `${innerHeight - targetBoundingRect.bottom}px`,
                        left: `${targetBoundingRect.left}px`,
                    },
                },
                {
                    grow: 'down-left',
                    expectedPosition: {
                        top: `${targetBoundingRect.bottom}px`,
                        right: `${innerWidth - targetBoundingRect.left}px`,
                    },
                },
                {
                    grow: 'up-left',
                    expectedPosition: {
                        bottom: `${innerHeight - targetBoundingRect.bottom}px`,
                        right: `${innerWidth - targetBoundingRect.left}px`,
                    },
                },
            ],
        },
        {
            position: 'top-right',
            targetBoundingRect,
            growthTypes: [
                {
                    grow: 'down-right',
                    expectedPosition: {
                        top: `${targetBoundingRect.top}px`,
                        left: `${targetBoundingRect.right}px`,
                    },
                },
                {
                    grow: 'up-right',
                    expectedPosition: {
                        bottom: `${innerHeight - targetBoundingRect.top}px`,
                        left: `${targetBoundingRect.right}px`,
                    },
                },
                {
                    grow: 'down-left',
                    expectedPosition: {
                        top: `${targetBoundingRect.top}px`,
                        right: `${innerWidth - targetBoundingRect.right}px`,
                    },
                },
                {
                    grow: 'up-left',
                    expectedPosition: {
                        bottom: `${innerHeight - targetBoundingRect.top}px`,
                        right: `${innerWidth - targetBoundingRect.right}px`,
                    },
                },
            ],
        },
        {
            position: 'bottom-right',
            targetBoundingRect,
            growthTypes: [
                {
                    grow: 'down-right',
                    expectedPosition: {
                        top: `${targetBoundingRect.bottom}px`,
                        left: `${targetBoundingRect.right}px`,
                    },
                },
                {
                    grow: 'up-right',
                    expectedPosition: {
                        bottom: `${innerHeight - targetBoundingRect.bottom}px`,
                        left: `${targetBoundingRect.right}px`,
                    },
                },
                {
                    grow: 'down-left',
                    expectedPosition: {
                        top: `${targetBoundingRect.bottom}px`,
                        right: `${innerWidth - targetBoundingRect.right}px`,
                    },
                },
                {
                    grow: 'up-left',
                    expectedPosition: {
                        bottom: `${innerHeight - targetBoundingRect.bottom}px`,
                        right: `${innerWidth - targetBoundingRect.right}px`,
                    },
                },
            ],
        },
    ].forEach((testCase) => {
        testCase.growthTypes.forEach((growthType) => {
            test(`Positions correctly when 'position="${testCase.position}"' and 'grow="${growthType.grow}"'`, () => {
                renderTooltip({
                    children: targetContent,
                    content: tooltipContent,
                    openOn: 'click',
                    position: testCase.position as TooltipProps['position'],
                    grow: growthType.grow as TooltipProps['grow'],
                });

                const target = screen.getByText(targetContent);
                // @ts-ignore - DOMRect needs a toJSON() method but we dont use it so we can ignore for testing
                target.getBoundingClientRect = jest.fn(() => targetBoundingRect);
                userEvent.click(target);
                const tooltip = screen.getByText(tooltipContent);
                expect(tooltip).toHaveStyle(growthType.expectedPosition);
            });
        });
    });
});
