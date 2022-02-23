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
        expect(outgoingListener).toHaveBeenCalledWith({
            event: 'instrument-selected',
            direction: 'out',
            data: { ticker: 'TICK' },
        });

        incomingListener.mockReset();
        outgoingListener.mockReset();

        bus.emit('instrument-selected', { ticker: 'TICK' }, 'in');
        expect(outgoingListener).not.toHaveBeenCalled();
        expect(incomingListener).toHaveBeenCalledWith({
            event: 'instrument-selected',
            direction: 'in',
            data: { ticker: 'TICK' },
        });

        incomingListener.mockReset();
        outgoingListener.mockReset();

        bus.emit('instrument-selected', { ticker: 'TICK' }, 'both');
        expect(incomingListener).toHaveBeenCalledWith({
            event: 'instrument-selected',
            direction: 'in',
            data: { ticker: 'TICK' },
        });
        expect(outgoingListener).toHaveBeenCalledWith({
            event: 'instrument-selected',
            direction: 'out',
            data: { ticker: 'TICK' },
        });

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
        const componentCallback1 = jest.fn();
        const componentCallback2 = jest.fn();
        const appCallback = jest.fn();
        const bus = new MessageBus();
        bus.on('instrument-selected', appCallback, 'out');

        function TestComponent({ componentCallback }: { componentCallback: () => void }) {
            const bus = useMessageListener('instrument-selected', componentCallback, 'out');
            return (
                <button data-testid="button" onClick={() => bus.emit('instrument-selected', { ticker: 'TICK' }, 'out')}>
                    button
                </button>
            );
        }

        const { rerender, unmount } = render(
            <Provider bus={bus}>
                <TestComponent componentCallback={componentCallback1} />
            </Provider>
        );

        userEvent.click(screen.getByTestId('button'));
        expect(componentCallback1).toHaveBeenCalledWith({
            event: 'instrument-selected',
            direction: 'out',
            data: { ticker: 'TICK' },
        });
        expect(appCallback).toHaveBeenCalledWith({
            event: 'instrument-selected',
            direction: 'out',
            data: { ticker: 'TICK' },
        });
        componentCallback1.mockClear();
        appCallback.mockClear();

        rerender(
            <Provider bus={bus}>
                <TestComponent componentCallback={componentCallback2} />
            </Provider>
        );
        userEvent.click(screen.getByTestId('button'));
        expect(componentCallback1).not.toHaveBeenCalled();
        expect(componentCallback2).toHaveBeenCalledWith({
            event: 'instrument-selected',
            direction: 'out',
            data: { ticker: 'TICK' },
        });
        expect(appCallback).toHaveBeenCalledWith({
            event: 'instrument-selected',
            direction: 'out',
            data: { ticker: 'TICK' },
        });

        unmount();
        bus.emit('instrument-selected', { ticker: 'TICK' }, 'out');
        expect(componentCallback1).not.toHaveBeenCalled();
        expect(appCallback).toHaveBeenCalledWith({
            event: 'instrument-selected',
            direction: 'out',
            data: { ticker: 'TICK' },
        });
    });
});
