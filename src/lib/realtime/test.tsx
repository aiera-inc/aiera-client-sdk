import React from 'react';
import Pusher from 'pusher-js';
import { renderWithClient } from '@aiera/client-sdk/testUtils';
import { Provider, useRealtimeEvent } from '.';

describe('realtime', () => {
    const bind = jest.fn();
    const unbind = jest.fn();
    const unsubscribe = jest.fn();
    const subscribe = jest.fn(() => ({ bind, unbind, unsubscribe }));

    const mockClient = { subscribe } as unknown as Pusher;

    afterEach(() => {
        bind.mockClear();
        unbind.mockClear();
        subscribe.mockClear();
        unsubscribe.mockClear();
    });

    test('can render with no client', () => {
        const callback = jest.fn();
        function TestComponent() {
            useRealtimeEvent('channel', 'event', callback);
            return null;
        }

        renderWithClient(
            <Provider>
                <TestComponent />
            </Provider>
        );
    });

    test('subscribes and unsubscribes to channels', () => {
        const callback = jest.fn();
        function TestComponent() {
            useRealtimeEvent('channel', 'event', callback);
            return null;
        }

        const { rendered } = renderWithClient(
            <Provider client={mockClient}>
                <TestComponent />
            </Provider>
        );

        expect(subscribe).toHaveBeenCalledWith('channel');
        expect(bind).toHaveBeenCalledWith('event', callback);

        rendered.unmount();

        expect(unbind).toHaveBeenCalledWith('event', callback);
        expect(unsubscribe).toHaveBeenCalled();
    });
});
