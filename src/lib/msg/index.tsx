import React, { createContext, useContext, useEffect, ReactNode, ReactElement } from 'react';
import type { InstrumentID } from '@finos/fdc3';
import EventEmitter from 'eventemitter3';
import type { ValueOf } from '@aiera/client-sdk/types';
import type { AuthTokens } from '@aiera/client-sdk/api/auth';

type Direction = 'in' | 'out';

interface EventAlert {
    description: string;
    tickerList: string[];
    eventIds: string[];
}

export interface MessageBusEvents {
    authenticate: AuthTokens;
    authenticated: null;
    'event-alert': EventAlert;
    'instrument-selected': InstrumentID;
    'instruments-selected': InstrumentID[];
    'open-url': string;
}

export interface Message<E extends keyof MessageBusEvents> {
    event: E;
    direction: Direction;
    data: MessageBusEvents[E];
}

export interface AieraMessageEvent extends MessageEvent {
    data: { ns: 'aiera'; event: keyof MessageBusEvents; data: ValueOf<MessageBusEvents> };
}

/**
 * HAndles messaging into and out of the app with a predefined set of events
 * that can be handled.
 */
export class MessageBus {
    emitter: EventEmitter;
    parent?: Window;

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
    emit<E extends keyof MessageBusEvents>(event: E, data: Message<E>['data'], direction: Direction | 'both'): boolean {
        const directions: Direction[] = direction === 'both' ? ['in', 'out'] : [direction];
        return directions
            .map((dir) => {
                this.sendWindowMessage(event, data, dir);
                return this.emitter.emit(`${dir}-${event}`, { event, data, direction: dir });
            })
            .reduce((prev, curr) => prev && curr);
    }

    removeAllListeners(): MessageBus {
        this.emitter.removeAllListeners();
        return this;
    }

    /**
     * Setups up messaging between this instance/module and a parent window.
     * Used for embedding modules into other web platforms.
     *
     * @param parent - The parent window that will be embedding the widget and communicating
     *                 with it.
     */
    setupWindowMessaging(parent: Window) {
        if (window !== parent) {
            this.parent = parent;
            window.addEventListener('message', this.onWindowMessage);
        }
    }

    /**
     * Cleans up the listeners and removes the parent/module communication channel.
     */
    cleanupWindowMessaging() {
        window.removeEventListener('message', this.onWindowMessage);
        delete this.parent;
    }

    /**
     * Listens for incoming messages from the parent window, checks that we are the intended
     * target, and dispatches the message to the local message bus.
     */
    onWindowMessage = (windowEvent: AieraMessageEvent) => {
        // Check to make sure it's actually an Aiera message before moving on
        if (windowEvent.data?.ns === 'aiera') {
            const { event, data } = windowEvent.data;
            this.emitter.emit(`in-${event}`, { direction: 'in', event, data });
        }
    };

    /**
     * Sends a message out to the parent window.
     */
    sendWindowMessage<E extends keyof MessageBusEvents>(event: E, data: Message<E>['data'], direction: Direction) {
        if (direction === 'out') {
            this.parent?.postMessage(
                {
                    ns: 'aiera',
                    event,
                    data,
                },
                '*'
            );
        }
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
    }, [listener]);
    return bus;
}
