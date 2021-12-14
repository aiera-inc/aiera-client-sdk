import React, { FC, ReactElement, StrictMode } from 'react';
import ReactDOM from 'react-dom';

import { Provider } from '@aiera/client-sdk/components/Provider';
import { Auth } from '@aiera/client-sdk/modules/Auth';
import { RecordingList } from '@aiera/client-sdk/modules/RecordingList';
import '@aiera/client-sdk/css/styles.css';

const App: FC = (): ReactElement => {
    return (
        <StrictMode>
            <Provider
                config={{
                    assetPath: 'bundle/',
                    moduleName: 'RecordingList',
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
                        <RecordingList />
                    </div>
                </Auth>
            </Provider>
        </StrictMode>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
