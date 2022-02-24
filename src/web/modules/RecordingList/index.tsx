import React, { FC, ReactElement, StrictMode } from 'react';
import ReactDOM from 'react-dom';

import { Provider } from '@aiera/client-sdk/components/Provider';
import { Auth } from '@aiera/client-sdk/modules/Auth';
import { RecordingList } from '@aiera/client-sdk/modules/RecordingList';
import '@aiera/client-sdk/css/styles.css';

const App: FC = (): ReactElement => {
    return (
        <StrictMode>
            <Provider config={{ moduleName: 'RecordingList' }}>
                <Auth>
                    <div className="h-full border border-black">
                        <RecordingList />
                    </div>
                </Auth>
            </Provider>
        </StrictMode>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
