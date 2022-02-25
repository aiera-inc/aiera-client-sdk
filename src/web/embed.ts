/**
 * # Embeded Aiera Modules
 *
 * This file is meant to loaded via the `<script/>` tag into a web application
 * that would like to embed Aiera modules. It exposes a global `window.Aiera` namespace
 * with utilities for loading Aiera modules into iframes inside the web application and
 * communicating with them.
 *
 *
 * See [[Module]] for more details.
 *
 * ## Example usage
 * @example
 *
 * index.html
 * ```
 * <html>
 *     <head>
 *         <script src="https://aiera-inc.github.io/aiera-client-sdk/embed.js"></script>
 *     </head>
 *     <body>
 *         <iframe height="575" width="375" id="aiera-event-list"></iframe>
 *         <script>
 *             const eventList = new Aiera.Module(
 *                 'https://aiera-inc.github.io/aiera-client-sdk/modules/EventList/index.html',
 *                 'aiera-event-list'
 *             );
 *
 *             eventList.load().then(() => {
 *                  // If you want to bypass the login screen, you must get credentials
 *                  // via the API and then pass them here. This is optional.
 *
 *                  // See [[web/embed#authenticate]] for examples of how to get tokens.
 *
 *                  // eventList.authenticate({
 *                  //     accessToken: '[accesstoken]',
 *                  //     refreshToken: '[refreshToken]',
 *                  // });
 *             });
 *
 *             // Once authenticated, you can pass data to the module, such as setting
 *             // up a watchlist
 *             eventList.on('authenticated', () => {
 *                 // Set up a watchlist after authentication
 *                 // eventList.setWatchlist([
 *                 //     { ticker: 'AAPL' },
 *                 //     { ticker: 'GOOGL' },
 *                 //     { ticker: 'TLSA' },
 *                 //     { ticker: 'PTON' },
 *                 // ]);
 *             });
 *         </script>
 *     </body>
 * </html>
 * ```
 *
 * ## Authentication
 * By default Aiera modules will display a login screen and ask for existing user credentials
 * in order to login and gain access to the module. However, some applications may handle user
 * creation on their own and would prefer to automatically log those users into the module.
 * For that use case, you can exchange user credentials for auth tokens and then call [[Module.authenticate]]
 * with the tokens to bypass the login screen.
 *
 * ### Examples of getting user auth tokens
 *
 * These are examples of how to exchange user credentials for tokens that can be passed to
 * [[Module.authenticate]].
 *
 * <br/>
 * <br/>
 *
 * @example
 *
 * #### bash
 *
 * ```bash
 * # Exchange username/password for auth tokens using curl
 * curl -v \
 *      -X POST \
 *      -H 'Content-Type: application/json' \
 *      -d '{"query":"mutation Login($email: String!, $password: String!){login(email: $email, password: $password){accessToken,refreshToken}}","variables":{"email": "[email]", "password": "[password]"}}' \
 *      https://api.aiera.com/graphql \
 *      | jq '.data.login'
 * ```
 * <br/>
 * <br/>
 *
 * #### javascript
 *
 * ```javascript
 * email = '';
 * password = '';
 *
 * authTokens = await fetch(
 *    'https://api.aiera.com/graphql',
 *    {
 *        method: 'POST',
 *        headers: {'Content-Type': 'application/json'},
 *        body: JSON.stringify({
 *           query: `
 *           mutation Login($email: String!, $password: String!) {
 *               login(email: $email, password: $password) {
 *                   accessToken
 *                   refreshToken
 *               }
 *           }
 *           `,
 *           variables: {
 *               email: email,
 *               password: password
 *           }
 *        })
 *    }
 * ).then(resp => resp.json()).then(json => json.data.login);
 * ```
 *
 * <br/>
 * <br/>
 *
 * #### python
 *
 * ```python
 * import requests
 *
 * query = """
 * mutation Login($email: String!, $password: String!) {
 *     login(email: $email, password: $password) {
 *         accessToken
 *         refreshToken
 *     }
 * }
 * """
 * email = ""
 * password = ""
 *
 * req = requests.post( "https://api.aiera.com/graphql", json={"query":query, "variables":{"email": email, "password": password}})
 * auth_tokens = tokens = req.json()['data']['login']
 * ```
 *
 * @module
 */
import EventEmitter from 'eventemitter3';
import type { InstrumentID } from '@finos/fdc3';
import type { AieraMessageEvent, Message, MessageBusEvents } from '@aiera/client-sdk/lib/msg';
import type { AuthTokens } from '@aiera/client-sdk/api/auth';

/**
 * This module exposes utilities that can be used to embed individual
 * Aiera modules into another web application via iframe.
 *
 * Exposed into the global context as `window.Aiera.Module`.
 */
export class Module {
    /** @ignore */
    private emitter: EventEmitter;
    /** @ignore */
    private module: URL;
    /** @ignore */
    private frameId: string;
    /** @ignore */
    private frame?: HTMLIFrameElement;

    /**
     * @param modulePath - The URL for the embeddable module
     * @param frameId    - the id of the iframe in which to load the module, must be present in the document when
     * `load()` is called
     */
    constructor(modulePath: string, frameId: string) {
        this.emitter = new EventEmitter();
        this.frameId = frameId;
        this.module = new URL(modulePath, window.location.toString());
    }

    /**
     * @ignore
     * Listens for messages from the module and dispatches them to any listeners.
     */
    onWindowMessage = (windowEvent: AieraMessageEvent) => {
        // Check to make sure it's actually an Aiera message before moving on
        if (windowEvent.origin === this.module.origin && windowEvent.data?.ns === 'aiera') {
            this.emitter.emit(windowEvent.data.event, windowEvent.data.data);
        }
    };

    /**
     * Loads the module into the given iframe and sets up messaging between the frame
     * and the parent window.
     *
     * @returns A promise that is resolved when the module is loaded into the frame.
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
     * Emit's an event into the module. Only use this if there is no dedicated
     * method for the action you are taking.
     *
     * For example, prefer `module.authenticate(...)` on `module.emit('authenticate', ...)`
     *
     * @param event - Must be one of [[MessageBusEvents]]
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
     * Sets up a listener for events coming from the module.
     *
     * @param event - Must be one of [[MessageBusEvents]]
     *
     * See {@link MessageBusEvents}
     */
    on<E extends keyof MessageBusEvents>(event: E, listener: (msg: Message<E>) => void): Module {
        this.emitter.on(event, listener);
        return this;
    }

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
    authenticate(tokens: AuthTokens) {
        this.emit('authenticate', tokens);
    }

    setWatchlist(instruments: InstrumentID[]) {
        this.emit('instruments-selected', instruments);
    }

    /**
     * Unloads the module and remove message listeners.
     */
    unload() {
        if (this.frame) this.frame.src = '';
        window.removeEventListener('message', this.onWindowMessage);
    }
}

// eslint-disable-next-line
// @ts-ignore
window.Aiera = { Module };
