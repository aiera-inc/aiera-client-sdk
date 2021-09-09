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
});
