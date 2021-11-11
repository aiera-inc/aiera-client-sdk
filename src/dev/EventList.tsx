import React, { FC, ReactElement, StrictMode } from 'react';
import ReactDOM from 'react-dom';

import { Provider as ClientProvider } from '@aiera/client-sdk/api/client';
import { useMessageListener, Provider as MessageBusProvider } from '@aiera/client-sdk/lib/msg';
import { Provider as ConfigProvider } from '@aiera/client-sdk/lib/config';
import { Provider as RealtimeProvider } from '@aiera/client-sdk/lib/realtime';
import { Provider as StorageProvider } from '@aiera/client-sdk/lib/storage';
import { Auth } from '@aiera/client-sdk/modules/Auth';
import { EventList } from '@aiera/client-sdk/modules/EventList';
import '@aiera/client-sdk/css/styles.css';

const App: FC = (): ReactElement => {
    const bus = useMessageListener(
        'instrument-selected',
        (msg) => {
            console.log(`Sending ${JSON.stringify(msg)} to platform`);
        },
        'out'
    );
    return (
        <StrictMode>
            <ConfigProvider
                config={{
                    apiUrl: 'https://api-dev.aiera.com/graphql',
                    assetPath: 'bundle/',
                    moduleName: 'EventList',
                    platform: 'aiera-sdk-dev',
                }}
            >
                <MessageBusProvider bus={bus}>
                    <ClientProvider>
                        <RealtimeProvider>
                            <StorageProvider>
                                <Auth showLogout>
                                    <div className="h-full border border-black">
                                        <EventList />
                                    </div>
                                </Auth>
                            </StorageProvider>
                        </RealtimeProvider>
                    </ClientProvider>
                </MessageBusProvider>
            </ConfigProvider>
        </StrictMode>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
