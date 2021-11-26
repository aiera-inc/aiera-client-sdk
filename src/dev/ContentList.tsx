import React, { FC, ReactElement, StrictMode } from 'react';
import ReactDOM from 'react-dom';

import { Provider } from '@aiera/client-sdk/components/Provider';
import { useMessageListener } from '@aiera/client-sdk/lib/msg';
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
            <Provider
                bus={bus}
                config={{
                    assetPath: 'bundle/',
                    moduleName: 'ContentList',
                    platform: 'aiera-sdk-dev',
                    gqlOptions: {
                        clientOptions: {
                            url: 'https://api-dev.aiera.com/graphql',
                        },
                    },
                }}
            >
                <Auth showLogout>
                    <div className="h-full border border-black">
                        <ContentList />
                    </div>
                </Auth>
            </Provider>
        </StrictMode>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
