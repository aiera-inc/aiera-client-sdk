import React, { FC, ReactElement } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'urql';
import { getGQLClient } from 'gql';
import { Auth } from 'modules';

const client = getGQLClient();

const App: FC = (): ReactElement => {
    return (
        <div>
            <div>Playground</div>
            <Provider value={client}>
                <Auth />
            </Provider>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
