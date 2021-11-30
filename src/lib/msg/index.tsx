import React, { createContext, useContext, useEffect, ReactNode, ReactElement } from 'react';
import type { InstrumentID } from '@finos/fdc3';
import EventEmitter from 'eventemitter3';

type Direction = 'in' | 'out';

interface MessageBusEvents {
    'instrument-selected': InstrumentID;
    'instruments-selected': InstrumentID[];
}

export interface Message<E extends keyof MessageBusEvents> {
    direction: Direction;
    data: MessageBusEvents[E];
}

/**
 * HAndles messaging into and out of the app with a predefined set of events
 * that can be handled.
 */
export class MessageBus {
    emitter: EventEmitter;

    constructor() {
        this.emitter = new EventEmitter();
    }

    /**
     * Register a listener for an event.
     */
    on<E extends keyof MessageBusEvents>(
        event: E,
        listener: (msg: Message<E>) => void,
        direction: Direction | 'both'
    ): MessageBus {
        const directions: Direction[] = direction === 'both' ? ['in', 'out'] : [direction];
        directions.forEach((dir) => {
            this.emitter.on(`${dir}-${event}`, listener);
        });
        return this;
    }

    /**
     * Unregister a listener for an event.
     */
    off<E extends keyof MessageBusEvents>(
        event: E,
        listener: (msg: Message<E>) => void,
        direction: Direction | 'both'
    ): MessageBus {
        const directions: Direction[] = direction === 'both' ? ['in', 'out'] : [direction];
        directions.forEach((dir) => {
            this.emitter.off(`${dir}-${event}`, listener);
        });
        return this;
    }

    /**
     * Emit an event.
     */
    emit<E extends keyof MessageBusEvents>(event: E, data: Message<E>['data'], direction: Direction): boolean {
        return this.emitter.emit(`${direction}-${event}`, { data, direction });
    }

    removeAllListeners(): MessageBus {
        this.emitter.removeAllListeners();
        return this;
    }
}

const Context = createContext<MessageBus>(new MessageBus());

/**
 * A React Provider to configure an app-level MessageBus
 */
export const Provider = ({ bus, children }: { bus?: MessageBus; children: ReactNode }): ReactElement => {
    return <Context.Provider value={bus || new MessageBus()}>{children}</Context.Provider>;
};

export const useMessageBus = (): MessageBus => {
    return useContext(Context);
};

/**
 * Hook to easily setup a message bus listener that will unregister
 * when the component unmounts.
 */
export function useMessageListener<E extends keyof MessageBusEvents>(
    type: E,
    listener: (msg: Message<E>) => void | Promise<void>,
    direction: Direction | 'out'
): MessageBus {
    const bus = useMessageBus();
    useEffect(() => {
        // Wrap the listener to it returns void, so that async functions
        // can be passed in (as long as the return is ignored).
        const wrappedListener = (msg: Message<E>) => {
            void listener(msg);
        };
        bus.on(type, wrappedListener, direction);

        return () => {
            bus.off(type, wrappedListener, direction);
        };
    }, []);
    return bus;
}
