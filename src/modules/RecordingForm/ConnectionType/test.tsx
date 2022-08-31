import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProvider } from '@aiera/client-sdk/testUtils';
import {
    CONNECTION_TYPE_OPTIONS,
    CONNECTION_TYPE_OPTION_GOOGLE,
    CONNECTION_TYPE_OPTION_PHONE,
    CONNECTION_TYPE_OPTION_WEBCAST,
    CONNECTION_TYPE_OPTION_ZOOM,
    ConnectionType as ConnectionTypeEnum,
} from '@aiera/client-sdk/modules/RecordingForm/types';
import { ConnectionType } from './index';

describe('ConnectionType', () => {
    const onChange = jest.fn();

    test('renders', () => {
        renderWithProvider(<ConnectionType connectionTypeOptions={CONNECTION_TYPE_OPTIONS} onChange={onChange} />);
        screen.getByText('Connection Type');
    });

    test('renders options with checkboxes', () => {
        renderWithProvider(<ConnectionType connectionTypeOptions={CONNECTION_TYPE_OPTIONS} onChange={onChange} />);
        screen.getByText(CONNECTION_TYPE_OPTION_ZOOM.label);
        screen.getByText(CONNECTION_TYPE_OPTION_GOOGLE.label);
        screen.getByText(CONNECTION_TYPE_OPTION_WEBCAST.label);
        screen.getByText(CONNECTION_TYPE_OPTION_PHONE.label);
    });

    test('when connectionType is set, renders selected option', () => {
        const { rendered } = renderWithProvider(
            <ConnectionType
                connectionType={ConnectionTypeEnum.Zoom}
                connectionTypeOptions={CONNECTION_TYPE_OPTIONS}
                onChange={onChange}
            />
        );
        expect(rendered.container.querySelector('svg')).not.toBeNull();
        const otherOption = screen.getByText(CONNECTION_TYPE_OPTION_GOOGLE.label).closest('div');
        if (otherOption) {
            // Click on another option
            userEvent.click(otherOption);
            // The other option should now have the checkmark
            // The checkmark svg is under a div that's a sibling of this element's parent div
            // so we need to go up two levels before looking for it
            expect(otherOption.parentNode?.parentNode?.querySelector('svg')).not.toBeNull();
        }
    });
});
