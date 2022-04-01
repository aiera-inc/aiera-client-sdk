import type { AieraMessageEvent, Message, MessageBusEvents } from '@aiera/client-sdk/lib/msg';
import type { AuthTokens } from '@aiera/client-sdk/api/auth';
import { Config } from '../lib/config';
export interface InstrumentID {
    CUSIP?: string;
    ISIN?: string;
    RIC?: string;
    ticker?: string;
}
/**
 * This module exposes utilities that can be used to embed individual
 * Aiera modules into another web application via iframe.
 *
 * Exposed into the global context as `window.Aiera.Module`.
 */
export declare class Module {
    /** @ignore */
    private emitter;
    /** @ignore */
    private module;
    /** @ignore */
    private frameId;
    /** @ignore */
    private frame?;
    /**
     * @param modulePath - The URL for the embeddable module
     * @param frameId    - the id of the iframe in which to load the module, must be present in the document when
     * `load()` is called
     */
    constructor(modulePath: string, frameId: string);
    /**
     * @ignore
     * Listens for messages from the module and dispatches them to any listeners.
     */
    onWindowMessage: (windowEvent: AieraMessageEvent) => void;
    /**
     * Loads the module into the given iframe and sets up messaging between the frame
     * and the parent window.
     *
     * @returns A promise that is resolved when the module is loaded into the frame.
     */
    load(): Promise<void>;
    /**
     * Emit's an event into the module. Only use this if there is no dedicated
     * method for the action you are taking.
     *
     * For example, prefer `module.authenticate(...)` on `module.emit('authenticate', ...)`
     *
     * @param event - Must be one of [[MessageBusEvents]]
     */
    emit<E extends keyof MessageBusEvents>(event: E, data: Message<E>['data']): void;
    /**
     * Sets up a listener for events coming from the module.
     *
     * @param event - Must be one of [[MessageBusEvents]]
     *
     * See {@link MessageBusEvents}
     */
    on<E extends keyof MessageBusEvents>(event: E, listener: (msg: Message<E>) => void): Module;
    /**
     * This method can be used to pass auth tokens directly to the module
     * to bypass the login screen for a user.
     *
     * You must hit the login API on your own to exchange username/password credentials
     * for user auth tokens which can then be passed here.
     *
     * See [[web/embed]] for more detailed examples.
     *
     *
     */
    authenticate(tokens: AuthTokens): void;
    /**
     * This method can be used to pass a config object
     * directly to the module
     *
     * Generally it should be used in the <module>.load().then(-here-) callback
     * so the settings are used from initialization
     */
    configure(config: Config): void;
    setWatchlist(instruments: InstrumentID[]): void;
    /**
     * Unloads the module and remove message listeners.
     */
    unload(): void;
}
//# sourceMappingURL=embed.d.ts.map