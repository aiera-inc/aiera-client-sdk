import React, { FC, ReactElement } from 'react';
import ReactDOM from 'react-dom';
import Frame from 'react-frame-component';

import '@aiera/client-sdk/css/styles.css';
import { Provider } from '@aiera/client-sdk/api/client';
import { Auth } from '@aiera/client-sdk/modules/Auth';
import { EventList } from '@aiera/client-sdk/modules/EventList';

const App: FC = (): ReactElement => {
    return (
        <div>
            <div>Playground</div>
            <Provider
                config={{
                    url: 'https://api-dev.aiera.com/graphql',
                    // url: 'https://aiera-pub.ngrok.io/graphql',
                }}
            >
                <Auth>
                    <Frame
                        width="370"
                        height="575"
                        head={<link type="text/css" rel="stylesheet" href="/index.css" />}
                        className="border border-black resize"
                    >
                        <div className="h-screen">
                            <EventList />
                        </div>
                    </Frame>
                </Auth>
            </Provider>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
