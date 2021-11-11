import React from 'react';
import { renderWithProvider } from '@aiera/client-sdk/testUtils';
import { useRealtimeEvent } from '.';

describe('realtime', () => {
    test('can render with no client', () => {
        const callback = jest.fn();
        function TestComponent() {
            useRealtimeEvent('channel', 'event', callback);
            return null;
        }

        renderWithProvider(<TestComponent />);
    });

    test('subscribes and unsubscribes to channels', () => {
        const callback = jest.fn();
        function TestComponent() {
            useRealtimeEvent('channel', 'event', callback);
            return null;
        }

        const { realtime, rendered } = renderWithProvider(<TestComponent />);

        expect(realtime.subscribe).toHaveBeenCalledWith('channel');
        realtime.trigger('channel', 'event', 'data');
        expect(callback).toHaveBeenCalledWith('data');

        callback.mockClear();

        rendered.unmount();
        expect(callback).not.toHaveBeenCalled();

        expect(realtime.mockedChannels['channel']?.unbind).toHaveBeenCalledWith('event', callback);
        expect(realtime.mockedChannels['channel']?.unsubscribe).toHaveBeenCalled();
    });
});
