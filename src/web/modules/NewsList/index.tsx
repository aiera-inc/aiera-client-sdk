import React, { FC, ReactElement, StrictMode, useEffect } from 'react';
import ReactDOM from 'react-dom';
import type { Instrument, InstrumentList, Listener } from '@finos/fdc3';

import { Provider } from '@aiera/client-sdk/components/Provider';
import { useMessageListener } from '@aiera/client-sdk/lib/msg';
import { useClient } from '@aiera/client-sdk/api/client';
import { Auth } from '@aiera/client-sdk/modules/Auth';
import { defaultTokenAuthConfig } from '@aiera/client-sdk/api/auth';
import { NewsList } from '@aiera/client-sdk/modules/NewsList';
import '@aiera/client-sdk/css/styles.css';

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
        'authenticate',
        (msg) => {
            void defaultTokenAuthConfig.writeAuth(msg.data);
            reset();
        },
        'in'
    );

    useEffect(() => {
        bus.setupWindowMessaging(window.parent);

        const listeners: Listener[] = [];
        if (window.fdc3) {
            listeners.push(
                window.fdc3.addContextListener('fdc3.instrument', (_context) => {
                    const context = _context as Instrument;
                    bus.emit('instrument-selected', context.id, 'in');
                })
            );

            listeners.push(
                window.fdc3.addContextListener('fdc3.instrumentList', (_context) => {
                    const context = _context as InstrumentList;
                    if (context.instruments) {
                        bus.emit(
                            'instruments-selected',
                            context.instruments.map((i) => i.id),
                            'in'
                        );
                    }
                })
            );
        }

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
            <Provider bus={bus} config={{ moduleName: 'NewsList' }}>
                <Auth>
                    <div className="h-full border border-black">
                        <NewsList />
                    </div>
                </Auth>
            </Provider>
        </StrictMode>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
