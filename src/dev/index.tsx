import React, { FC, ReactElement } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'client';
import { Auth } from 'modules';

const App: FC = (): ReactElement => {
    return (
        <div>
            <div>Playground</div>
            <Provider
                config={{
                    url: 'https://api-dev.aiera.com/graphql',
                }}
            >
                <Auth />
            </Provider>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
