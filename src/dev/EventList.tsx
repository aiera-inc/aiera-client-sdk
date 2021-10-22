import React, { FC, ReactElement } from 'react';
import ReactDOM from 'react-dom';

import { Provider as ClientProvider } from '@aiera/client-sdk/api/client';
import { useMessageListener, Provider as MessageBusProvider } from '@aiera/client-sdk/lib/msg';
import { Provider as ConfigProvider } from '@aiera/client-sdk/lib/config';
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
        <ConfigProvider config={{ apiUrl: 'https://api-dev.aiera.com/graphql', assetPath: 'bundle/' }}>
            <MessageBusProvider bus={bus}>
                <ClientProvider>
                    <Auth showLogout>
                        <div className="h-full border border-black">
                            <EventList />
                        </div>
                    </Auth>
                </ClientProvider>
            </MessageBusProvider>
        </ConfigProvider>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
