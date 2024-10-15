import React, { FC, ReactElement, StrictMode } from 'react';

import { Provider } from '@aiera/client-sdk/components/Provider';
import '@aiera/client-sdk/css/styles.css';
import { Auth } from '@aiera/client-sdk/modules/Auth';
import { EventList } from '@aiera/client-sdk/modules/EventList';
import { createRoot } from 'react-dom/client';

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

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
