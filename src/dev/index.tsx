import React, { FC, ReactElement } from 'react';
import ReactDOM from 'react-dom';

import '@aiera/client-sdk/css/styles.css';
import { Provider } from '@aiera/client-sdk/api/client';
import { Auth } from '@aiera/client-sdk/modules/Auth';
import { EventList } from '@aiera/client-sdk/modules/EventList';

const App: FC = (): ReactElement => {
    return (
        <div>
            <Provider
                config={{
                    url: 'https://api-dev.aiera.com/graphql',
                    // url: 'https://aiera-pub.ngrok.io/graphql',
                }}
            >
                <Auth showLogout>
                    <div id="frame-content" className="border border-black">
                        <EventList onSelectEvent={console.log} />
                    </div>
                </Auth>
            </Provider>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
