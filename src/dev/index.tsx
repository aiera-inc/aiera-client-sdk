import React, { FC, ReactElement } from 'react';
import ReactDOM from 'react-dom';
import { EventList } from 'components';

const App: FC = (): ReactElement => {
    return (
        <div>
            <div>Playground</div>
            <EventList />
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
