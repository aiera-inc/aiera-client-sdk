import React, { FC, ReactElement, StrictMode } from 'react';
import ReactDOM from 'react-dom';

import { Provider } from '@aiera/client-sdk/components/Provider';
import { Auth } from '@aiera/client-sdk/modules/Auth';
import { RecordingForm } from '@aiera/client-sdk/modules/RecordingForm';
import '@aiera/client-sdk/css/styles.css';

const App: FC = (): ReactElement => {
    return (
        <StrictMode>
            <Provider
                config={{
                    assetPath: 'bundle/',
                    moduleName: 'RecordingForm',
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
                        <RecordingForm onBack={() => null} />
                    </div>
                </Auth>
            </Provider>
        </StrictMode>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
