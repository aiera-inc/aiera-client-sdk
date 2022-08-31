import React from 'react';
import { fireEvent, screen } from '@testing-library/react';

import { ConnectionType, PARTICIPATION_TYPE_OPTIONS } from '@aiera/client-sdk/modules/RecordingForm/types';
import { renderWithProvider } from '@aiera/client-sdk/testUtils';
import { ConnectionDetails } from './index';

describe('ConnectionDetails', () => {
    const onChange = jest.fn();
    const props = {
        connectAccessId: '123456',
        connectCallerId: 'Shrimply Pibbles',
        connectionType: ConnectionType.Zoom,
        connectPhoneNumber: '555-555-5555',
        connectPin: '1234',
        connectUrl: 'https://zoom.us/j/8881234567?pwd=Ya1b2c3d4e5',
        onChangeConnectAccessId: onChange,
        onChangeConnectCallerId: onChange,
        onChangeConnectPhoneNumber: onChange,
        onChangeConnectPin: onChange,
        onChangeConnectUrl: onChange,
        onChangeParticipationType: onChange,
        participationTypeOptions: PARTICIPATION_TYPE_OPTIONS,
    };

    describe('when connection type is Zoom', () => {
        test('renders meeting type select', () => {
            renderWithProvider(<ConnectionDetails {...props} />);
            screen.getByText('Web URL');
            screen.getByText('Dial-in number');
        });

        test('when meeting type is not set, do not render any other fields', () => {
            renderWithProvider(<ConnectionDetails {...props} />);
            expect(screen.queryByPlaceholderText('https://zoom.us/j/8881234567?pwd=Ya1b2c3d4e5')).toBeNull();
            expect(screen.queryByPlaceholderText('(888)-123-4567')).toBeNull();
            expect(screen.queryByPlaceholderText('1234567890')).toBeNull();
            expect(screen.queryByDisplayValue(props.connectCallerId)).toBeNull();
            expect(screen.queryByDisplayValue(props.connectPin)).toBeNull();
        });

        test('when meeting type is web, render fields for web only', () => {
            renderWithProvider(<ConnectionDetails {...props} />);
            const webOption = screen.getByText('Web URL');
            fireEvent.click(webOption);
            expect(screen.queryByPlaceholderText('https://zoom.us/j/8881234567?pwd=Ya1b2c3d4e5')).toBeInTheDocument();
            expect(screen.queryByDisplayValue(props.connectCallerId)).toBeInTheDocument();
            expect(screen.queryByDisplayValue(props.connectPin)).toBeInTheDocument();
            // Do not render phone fields
            expect(screen.queryByPlaceholderText('(888)-123-4567')).toBeNull();
            expect(screen.queryByPlaceholderText('1234567890')).toBeNull();
            expect(screen.queryByText('Call me')).toBeNull();
            expect(screen.queryByText('Set it & forget it')).toBeNull();
        });

        test('when meeting type is phone, render fields for phone only', () => {
            renderWithProvider(<ConnectionDetails {...props} />);
            const phoneOption = screen.getByText('Dial-in number');
            fireEvent.click(phoneOption);
            expect(screen.queryByPlaceholderText('(888)-123-4567')).toBeInTheDocument();
            expect(screen.queryByPlaceholderText('1234567890')).toBeInTheDocument();
            expect(screen.queryByDisplayValue(props.connectPin)).toBeInTheDocument();
            screen.getByText('Call me');
            screen.getByText('Set it & forget it');
            // Do not render web fields
            expect(screen.queryByPlaceholderText('https://zoom.us/j/8881234567?pwd=Ya1b2c3d4e5')).toBeNull();
            expect(screen.queryByDisplayValue(props.connectCallerId)).toBeNull();
        });
    });

    describe('when connection type is Google Meet', () => {
        const googleProps = {
            ...props,
            connectionType: ConnectionType.GoogleMeet,
        };
        test('renders fields for Google Meet', () => {
            renderWithProvider(<ConnectionDetails {...googleProps} />);
            screen.getByText('Dial-in number*');
            expect(screen.queryByPlaceholderText('(888)-123-4567')).toBeInTheDocument();
            expect(screen.queryByDisplayValue(props.connectPin)).toBeInTheDocument();
            screen.getByText('Call me');
            screen.getByText('Set it & forget it');
        });
    });

    describe('when connection type is Webcast URL', () => {
        const webcastProps = {
            ...props,
            connectionType: ConnectionType.Webcast,
        };
        test('renders fields for Webcast URL', () => {
            renderWithProvider(<ConnectionDetails {...webcastProps} />);
            screen.getByText('Host URL*');
            expect(screen.queryByPlaceholderText('https://zoom.us/j/8881234567?pwd=Ya1b2c3d4e5')).toBeInTheDocument();
        });
    });

    describe('when connection type is Phone Number', () => {
        const webcastProps = {
            ...props,
            connectionType: ConnectionType.PhoneNumber,
        };
        test('renders fields for Phone Number', () => {
            renderWithProvider(<ConnectionDetails {...webcastProps} />);
            screen.getByText('Dial-in number*');
            expect(screen.queryByPlaceholderText('(888)-123-4567')).toBeInTheDocument();
            expect(screen.queryByPlaceholderText('1234567890')).toBeInTheDocument();
            expect(screen.queryByDisplayValue(props.connectPin)).toBeInTheDocument();
            screen.getByText('Call me');
            screen.getByText('Set it & forget it');
        });
    });
});
