import React, { FC, ReactElement, StrictMode, useEffect, useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import type { Instrument, InstrumentList, Listener } from '@finos/fdc3';

import { Provider } from '@aiera/client-sdk/components/Provider';
import { useMessageListener, MessageBus } from '@aiera/client-sdk/lib/msg';
import { Auth } from '@aiera/client-sdk/modules/Auth';
import { EventList } from '@aiera/client-sdk/modules/EventList';
import '@aiera/client-sdk/css/styles.css';
import { usePlaySound } from '../lib/data';

const useMessageBus = () => {
    const { playSound } = usePlaySound();

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

    // Play chime when events are starting!
    bus.on(
        'event-alert',
        () => {
            playSound();
        },
        'out'
    );

    useEffect(() => {
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
            listeners.forEach((listener) => listener.unsubscribe());
        };
    }, [bus]);

    return bus;
};

const useUrlSettings = (bus: MessageBus) => {
    const [moduleReady, setModuleRef] = useState(false);

    useEffect(() => {
        if (window.location && moduleReady) {
            const url = new URL(window.location.href);
            const tickers = (url.searchParams.get('tickers') || '').split(',');
            if (tickers.length) {
                bus.emit(
                    'instruments-selected',
                    tickers.map((ticker) => ({ ticker })),
                    'in'
                );
            }
        }
    }, [bus, moduleReady]);

    return useCallback(() => setModuleRef(true), []);
};

const App: FC = (): ReactElement => {
    const bus = useMessageBus();
    const setModuleRef = useUrlSettings(bus);
    return (
        <StrictMode>
            <Provider
                bus={bus}
                config={{
                    assetPath: 'bundle/',
                    moduleName: 'EventList',
                    platform: 'aiera-sdk-dev',
                    gqlOptions: {
                        clientOptions: {
                            url: 'https://api-dev.aiera.com/graphql',
                        },
                    },
                }}
            >
                <Auth>
                    <div className="h-full border border-black" ref={setModuleRef}>
                        <EventList />
                    </div>
                </Auth>
            </Provider>
        </StrictMode>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
