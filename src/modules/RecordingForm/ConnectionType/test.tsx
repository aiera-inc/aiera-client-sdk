import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProvider } from '@aiera/client-sdk/testUtils';
import { CONNECTION_TYPE_OPTIONS, ConnectionType as ConnectionTypeEnum } from '@aiera/client-sdk/modules/RecordingForm';
import { ConnectionType } from './index';

describe('ConnectionType', () => {
    const onChange = jest.fn();

    test('renders', () => {
        renderWithProvider(<ConnectionType connectionTypeOptions={CONNECTION_TYPE_OPTIONS} onChange={onChange} />);
        screen.getByText('Connection Type');
    });

    test('renders options with checkboxes', () => {
        renderWithProvider(<ConnectionType connectionTypeOptions={CONNECTION_TYPE_OPTIONS} onChange={onChange} />);
        screen.getByText(CONNECTION_TYPE_OPTIONS[ConnectionTypeEnum.Zoom].label);
        screen.getByText(CONNECTION_TYPE_OPTIONS[ConnectionTypeEnum.GoogleMeet].label);
        screen.getByText(CONNECTION_TYPE_OPTIONS[ConnectionTypeEnum.Webcast].label);
        screen.getByText(CONNECTION_TYPE_OPTIONS[ConnectionTypeEnum.PhoneNumber].label);
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
        const otherOption = screen
            .getByText(CONNECTION_TYPE_OPTIONS[ConnectionTypeEnum.GoogleMeet].label)
            .closest('div');
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
