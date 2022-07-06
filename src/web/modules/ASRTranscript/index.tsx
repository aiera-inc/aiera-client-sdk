import type { Listener } from '@finos/fdc3';
import React, { FC, ReactElement, StrictMode, useEffect } from 'react';
import ReactDOM from 'react-dom';

import { defaultTokenAuthConfig } from '@aiera/client-sdk/api/auth';
import { useClient } from '@aiera/client-sdk/api/client';
import { Provider } from '@aiera/client-sdk/components/Provider';
import '@aiera/client-sdk/css/styles.css';
import { useMessageListener } from '@aiera/client-sdk/lib/msg';
import { Transcript } from '@aiera/client-sdk/modules/Transcript';

const useMessageBus = () => {
    const bus = useMessageListener(
        'instrument-selected',
        (msg) => {
            if (window.fdc3 && msg.data) {
                const context = {
                    type: 'fdc3.instrument',
                    // FDC is really poorly typed, so need to cast this to
                    // something more generic
                    id: msg.data as { [key: string]: string },
                };
                void window.fdc3.broadcast(context);
            }
        },
        'out'
    );

    const { reset } = useClient();
    bus.on(
        'authenticateApiKey',
        (msg) => {
            void defaultTokenAuthConfig.loginWithApiKey(msg.data);
            reset();
        },
        'in'
    );

    useEffect(() => {
        bus.setupWindowMessaging(window.parent);

        const listeners: Listener[] = [];

        return () => {
            bus.cleanupWindowMessaging();
            listeners.forEach((listener) => listener.unsubscribe());
        };
    }, [bus]);

    return bus;
};

const App: FC = (): ReactElement => {
    const bus = useMessageBus();
    return (
        <StrictMode>
            <Provider bus={bus} config={{ moduleName: 'EventList' }}>
                <div className="h-full">
                    <Transcript asrMode />
                </div>
            </Provider>
        </StrictMode>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
