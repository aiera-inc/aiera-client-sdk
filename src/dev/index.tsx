import React, { FC, ReactElement } from 'react';
import ReactDOM from 'react-dom';
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
                    <div className="w-96 h-96">
                        <EventList />
                    </div>
                </Auth>
            </Provider>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
