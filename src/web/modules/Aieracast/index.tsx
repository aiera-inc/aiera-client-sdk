import type { Instrument, InstrumentList, Listener } from '@finos/fdc3';
import React, { FC, ReactElement, StrictMode, useEffect } from 'react';

import { defaultTokenAuthConfig } from '@aiera/client-sdk/api/auth';
import { useClient } from '@aiera/client-sdk/api/client';
import { Provider } from '@aiera/client-sdk/components/Provider';
import '@aiera/client-sdk/css/styles.css';
import { usePlaySound } from '@aiera/client-sdk/lib/data';
import { useMessageListener } from '@aiera/client-sdk/lib/msg';
import { Aieracast } from '@aiera/client-sdk/modules/Aieracast';
import { Auth } from '@aiera/client-sdk/modules/Auth';
import { createRoot } from 'react-dom/client';

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
            <Provider bus={bus} config={{ moduleName: 'Aieracast' }}>
                <Auth apiMode>
                    <div className="h-full">
                        <Aieracast />
                    </div>
                </Auth>
            </Provider>
        </StrictMode>
    );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
