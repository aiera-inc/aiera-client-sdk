import React from 'react';
import { renderWithClient } from '@aiera/client-sdk/testUtils';
import { useRealtimeEvent } from '.';

describe('realtime', () => {
    test('can render with no client', () => {
        const callback = jest.fn();
        function TestComponent() {
            useRealtimeEvent('channel', 'event', callback);
            return null;
        }

        renderWithClient(<TestComponent />);
    });

    test('subscribes and unsubscribes to channels', () => {
        const callback = jest.fn();
        function TestComponent() {
            useRealtimeEvent('channel', 'event', callback);
            return null;
        }

        const { realtime, rendered } = renderWithClient(<TestComponent />);

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
