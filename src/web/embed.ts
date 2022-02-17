import EventEmitter from 'eventemitter3';
import type { AieraMessageEvent, Message, MessageBusEvents } from '@aiera/client-sdk/lib/msg';
import type { AuthTokens } from '@aiera/client-sdk/api/auth';

/**
 * Utility to embed modules as iframe into a parent web application and set up
 * communication channels to control the module and listen to module events.
 */
class Module {
    emitter: EventEmitter;
    module: URL;
    frameId: string;
    frame?: HTMLIFrameElement;

    constructor(modulePath: string, frameId: string) {
        this.emitter = new EventEmitter();
        this.frameId = frameId;
        this.module = new URL(modulePath, window.location.toString());
    }

    /**
     * @private
     * Listens for messages from the module and dispatches them to any listeners.
     */
    onWindowMessage = (windowEvent: AieraMessageEvent) => {
        // Check to make sure it's actually an Aiera message before moving on
        if (windowEvent.origin === this.module.origin && windowEvent.data?.ns === 'aiera') {
            this.emitter.emit(windowEvent.data.event, windowEvent.data.data);
        }
    };

    /**
     * @private
     * Sends a message to the module
     */
    emit<E extends keyof MessageBusEvents>(event: E, data: Message<E>['data']) {
        this.frame?.contentWindow?.postMessage(
            {
                ns: 'aiera',
                event,
                data,
            },
            this.module.origin
        );
    }

    /**
     * Load the module into the frame and set up messaging.
     */
    load() {
        const frame = (this.frame = document.getElementById(this.frameId) as HTMLIFrameElement);
        frame.src = this.module.toString();
        window.addEventListener('message', this.onWindowMessage);
        return new Promise<void>((resolve, reject) => {
            frame.onload = () => resolve();
            frame.onerror = reject;
        });
    }

    /**
     * Unload the module and remove message listeners.
     */
    unload() {
        if (this.frame) this.frame.src = '';
        window.removeEventListener('message', this.onWindowMessage);
    }

    /**
     * Register a listener for an event.
     */
    on<E extends keyof MessageBusEvents>(event: E, listener: (msg: Message<E>) => void): Module {
        this.emitter.on(event, listener);
        return this;
    }

    authenticate(tokens: AuthTokens) {
        this.emit('authenticate', tokens);
    }
}

// eslint-disable-next-line
// @ts-ignore
window.Aiera = { Module };
