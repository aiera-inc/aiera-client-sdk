import React, { FC, ReactElement } from 'react';
import ReactDOM from 'react-dom';
import Frame from 'react-frame-component';

import 'css/styles.css';
import { Provider } from 'client';
import { Auth, EventList } from 'modules';

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
                        head={<link type="text/css" rel="stylesheet" href="/bundle/index.css" />}
                        className="border border-black resize w-96 h-96"
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
