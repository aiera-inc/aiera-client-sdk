import React, { FC, ReactElement, StrictMode } from 'react';
import ReactDOM from 'react-dom';

import { Provider } from '@aiera/client-sdk/components/Provider';
import { Auth } from '@aiera/client-sdk/modules/Auth';
import { Monitors } from '@aiera/client-sdk/modules/Monitors';
import '@aiera/client-sdk/css/styles.css';

const App: FC = (): ReactElement => {
    return (
        <StrictMode>
            <Provider
                config={{
                    assetPath: 'bundle/',
                    moduleName: 'Monitors',
                    platform: 'aiera-sdk-dev',
                    gqlOptions: {
                        clientOptions: {
                            url: 'https://api-dev.aiera.com/graphql',
                            fetch: (...args) => {
                                return window.fetch(...args);
                            },
                        },
                    },
                }}
            >
                <Auth showLogout>
                    <div className="h-full border border-black">
                        <Monitors />
                    </div>
                </Auth>
            </Provider>
        </StrictMode>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
