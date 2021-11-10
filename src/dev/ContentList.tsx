import React, { FC, ReactElement, StrictMode } from 'react';
import ReactDOM from 'react-dom';

import { Provider as ClientProvider } from '@aiera/client-sdk/api/client';
import { useMessageListener, Provider as MessageBusProvider } from '@aiera/client-sdk/lib/msg';
import { Provider as ConfigProvider } from '@aiera/client-sdk/lib/config';
import { Provider as RealtimeProvider } from '@aiera/client-sdk/lib/realtime';
import { Auth } from '@aiera/client-sdk/modules/Auth';
import { ContentList } from '@aiera/client-sdk/modules/ContentList';
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
                    moduleName: 'ContentList',
                    platform: 'aiera-sdk-dev',
                }}
            >
                <MessageBusProvider bus={bus}>
                    <ClientProvider>
                        <RealtimeProvider>
                            <Auth showLogout>
                                <div className="h-full border border-black">
                                    <ContentList />
                                </div>
                            </Auth>
                        </RealtimeProvider>
                    </ClientProvider>
                </MessageBusProvider>
            </ConfigProvider>
        </StrictMode>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
