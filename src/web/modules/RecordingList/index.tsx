import React, { FC, ReactElement, StrictMode } from 'react';
import ReactDOM from 'react-dom';

import { Provider } from '@aiera/client-sdk/components/Provider';
import { Auth } from '@aiera/client-sdk/modules/Auth';
import { EventList } from '@aiera/client-sdk/modules/EventList';
import '@aiera/client-sdk/css/styles.css';

const App: FC = (): ReactElement => {
    return (
        <StrictMode>
            <Provider
                config={{
                    moduleName: 'EventList',
                    options: {
                        customOnly: true,
                        eventListFilters: [{ name: 'transcripts', visible: true, defaultValue: false }],
                        eventListView: 'combined',
                        showCompanyFilter: true,
                        showScheduleRecording: true,
                    },
                }}
            >
                <Auth apiMode>
                    <div className="h-full">
                        <EventList />
                    </div>
                </Auth>
            </Provider>
        </StrictMode>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
