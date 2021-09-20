import { MessageBus } from '.';

describe('message bus', () => {
    test('listeners get fired when events are emitted', () => {
        const bus = new MessageBus();
        const incomingListener = jest.fn();
        const outgoingListener = jest.fn();

        bus.on('instrument-selected', incomingListener, 'in');
        bus.on('instrument-selected', outgoingListener, 'out');
        bus.emit('instrument-selected', { ticker: 'TICK' }, 'out');
        expect(incomingListener).not.toHaveBeenCalled();
        expect(outgoingListener).toHaveBeenCalledWith({ direction: 'out', data: { ticker: 'TICK' } });
    });
});
