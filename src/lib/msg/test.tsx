import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useMessageListener, MessageBus, Provider } from '.';

describe('message bus', () => {
    test('listeners get fired when events are emitted and not after they are removed', () => {
        const bus = new MessageBus();
        const incomingListener = jest.fn();
        const outgoingListener = jest.fn();

        bus.on('instrument-selected', incomingListener, 'in');
        bus.on('instrument-selected', outgoingListener, 'out');
        bus.emit('instrument-selected', { ticker: 'TICK' }, 'out');
        expect(incomingListener).not.toHaveBeenCalled();
        expect(outgoingListener).toHaveBeenCalledWith({ direction: 'out', data: { ticker: 'TICK' } });

        incomingListener.mockReset();
        outgoingListener.mockReset();

        bus.emit('instrument-selected', { ticker: 'TICK' }, 'in');
        expect(outgoingListener).not.toHaveBeenCalled();
        expect(incomingListener).toHaveBeenCalledWith({ direction: 'in', data: { ticker: 'TICK' } });

        incomingListener.mockReset();
        outgoingListener.mockReset();

        bus.off('instrument-selected', incomingListener, 'in');
        bus.off('instrument-selected', outgoingListener, 'out');
        bus.emit('instrument-selected', { ticker: 'TICK' }, 'out');
        bus.emit('instrument-selected', { ticker: 'TICK' }, 'in');
        expect(incomingListener).not.toHaveBeenCalled();
        expect(outgoingListener).not.toHaveBeenCalled();
    });

    test('removeAllListeners works', () => {
        const bus = new MessageBus();
        const incomingListener = jest.fn();
        const outgoingListener = jest.fn();

        bus.on('instrument-selected', incomingListener, 'in');
        bus.on('instrument-selected', outgoingListener, 'out');
        bus.removeAllListeners();
        bus.emit('instrument-selected', { ticker: 'TICK' }, 'out');
        expect(incomingListener).not.toHaveBeenCalled();
        expect(outgoingListener).not.toHaveBeenCalled();
    });

    test('useMessageListener sets up a listener in a component', () => {
        const componentCallback = jest.fn();
        const appCallback = jest.fn();
        const bus = new MessageBus();
        bus.on('instrument-selected', appCallback, 'out');

        function TestComponent() {
            const bus = useMessageListener('instrument-selected', componentCallback, 'out');
            return (
                <button data-testid="button" onClick={() => bus.emit('instrument-selected', { ticker: 'TICK' }, 'out')}>
                    button
                </button>
            );
        }

        const { unmount } = render(
            <Provider bus={bus}>
                <TestComponent />
            </Provider>
        );

        userEvent.click(screen.getByTestId('button'));
        expect(componentCallback).toHaveBeenCalledWith({ direction: 'out', data: { ticker: 'TICK' } });
        expect(appCallback).toHaveBeenCalledWith({ direction: 'out', data: { ticker: 'TICK' } });
        componentCallback.mockClear();
        appCallback.mockClear();
        unmount();
        bus.emit('instrument-selected', { ticker: 'TICK' }, 'out');
        expect(componentCallback).not.toHaveBeenCalled();
        expect(appCallback).toHaveBeenCalledWith({ direction: 'out', data: { ticker: 'TICK' } });
    });
});
