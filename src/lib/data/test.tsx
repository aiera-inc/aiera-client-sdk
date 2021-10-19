import React, { useEffect } from 'react';
import { renderWithClient } from 'testUtils';

import { useAutoTrack, useTrack } from '.';

describe('useTrack', () => {
    const TestComponent = () => {
        const track = useTrack();
        useEffect(() => {
            void track('View', 'Event', { eventId: 1 });
        }, []);
        return null;
    };

    test('calls the track mutation', () => {
        const { client } = renderWithClient(<TestComponent />);
        expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
            event: 'View | Event',
            properties: { eventId: 1 },
        });
    });
});

describe('useAutoTrack', () => {
    const TestComponent = ({ id, other: _, skip = false }: { id: string; other?: string; skip?: boolean }) => {
        useAutoTrack('View', 'Event', { eventId: id }, [id], skip);
        return null;
    };

    test('calls the track mutation, and calls it again on changes', () => {
        const { client, rerender } = renderWithClient(<TestComponent id="1" />);

        expect(client.mutation).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({
                event: 'View | Event',
                properties: { eventId: '1' },
            })
        );

        rerender(<TestComponent id="2" />);
        expect(client.mutation).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({
                event: 'View | Event',
                properties: { eventId: '2' },
            })
        );
    });

    test('doesnt call it again if deps dont change', () => {
        const { client, rerender } = renderWithClient(<TestComponent id="1" other="1" />);

        expect(client.mutation).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({
                event: 'View | Event',
                properties: { eventId: '1' },
            })
        );

        rerender(<TestComponent id="1" other="2" />);
        expect(client.mutation).toHaveBeenCalledTimes(1);
        expect(client.mutation).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({
                event: 'View | Event',
                properties: { eventId: '1' },
            })
        );
    });

    test('handles "skip" option', () => {
        const { client, rerender } = renderWithClient(<TestComponent id="1" skip />);

        expect(client.mutation).not.toHaveBeenCalled();

        rerender(<TestComponent id="2" />);
        expect(client.mutation).toHaveBeenCalledTimes(1);
        expect(client.mutation).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({
                event: 'View | Event',
                properties: { eventId: '2' },
            })
        );
    });
});
