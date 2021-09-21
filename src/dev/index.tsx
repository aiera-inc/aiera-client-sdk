import React, { FC, ReactElement } from 'react';
import ReactDOM from 'react-dom';

import { Provider as ClientProvider } from '@aiera/client-sdk/api/client';
import { useMessageListener, Provider as MessageBusProvider } from '@aiera/client-sdk/msg-bus';
import { Auth } from '@aiera/client-sdk/modules/Auth';
import { EventList } from '@aiera/client-sdk/modules/EventList';

const App: FC = (): ReactElement => {
    const bus = useMessageListener(
        'instrument-selected',
        (msg) => {
            console.log(`Sending ${JSON.stringify(msg)} to platform`);
        },
        'out'
    );
    return (
        <div>
            <MessageBusProvider bus={bus}>
                <ClientProvider
                    config={{
                        url: 'https://api-dev.aiera.com/graphql',
                        // url: 'https://aiera-pub.ngrok.io/graphql',
                    }}
                >
                    <Auth showLogout>
                        <div id="frame-content" className="border border-black">
                            <EventList />
                        </div>
                    </Auth>
                </ClientProvider>
            </MessageBusProvider>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
