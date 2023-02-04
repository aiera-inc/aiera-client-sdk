import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import {
    PARTICIPATION_TYPE_OPTIONS,
    ConnectionType,
    ParticipationType,
    ZoomMeetingType,
} from '@aiera/client-sdk/modules/RecordingForm/types';
import { actAndFlush, renderWithProvider } from '@aiera/client-sdk/testUtils';
import { ConnectionDetails } from './index';

jest.mock('@aiera/client-sdk/lib/hooks/useChangeHandlers');

describe('ConnectionDetails', () => {
    const onChange = jest.fn();
    const props = {
        connectAccessId: '123456',
        connectCallerId: 'Shrimply Pibbles',
        connectionType: ConnectionType.Zoom,
        connectPhoneNumber: '555-555-5555',
        connectPin: '1234',
        connectUrl: 'https://zoom.us/j/8881234567?pwd=Ya1b2c3d4e5',
        errors: {},
        onBlur: onChange,
        onChange,
        onConnectDialNumber: '555-123-4567',
        onFocus: onChange,
        participationTypeOptions: PARTICIPATION_TYPE_OPTIONS,
        smsAlertBeforeCall: false,
        touched: {},
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
            expect(screen.queryByText('Your phone number')).toBeNull();
        });

        test('when meeting type is web, render fields for web only', () => {
            renderWithProvider(<ConnectionDetails {...props} zoomMeetingType={ZoomMeetingType.Web} />);
            const webOption = screen.getByText('Web URL');
            fireEvent.click(webOption);
            expect(screen.queryByPlaceholderText('https://zoom.us/j/8881234567?pwd=Ya1b2c3d4e5')).toBeInTheDocument();
            expect(screen.queryByDisplayValue(props.connectUrl)).toBeInTheDocument();
            expect(screen.queryByDisplayValue(props.connectCallerId)).toBeInTheDocument();
            expect(screen.queryByDisplayValue(props.connectPin)).toBeInTheDocument();
            // Do not render phone fields
            expect(screen.queryByPlaceholderText('(888)-123-4567')).toBeNull();
            expect(screen.queryByPlaceholderText('1234567890')).toBeNull();
            expect(screen.queryByText('Call me')).toBeNull();
            expect(screen.queryByText('Set it & forget it')).toBeNull();
        });

        test('when meeting type is phone, render fields for phone only', async () => {
            await actAndFlush(() => {
                renderWithProvider(<ConnectionDetails {...props} zoomMeetingType={ZoomMeetingType.Phone} />);
            });
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

        test('when participation type is "Call me" and meeting type is phone, render phone number input', async () => {
            await actAndFlush(() => {
                renderWithProvider(
                    <ConnectionDetails
                        {...props}
                        participationType={ParticipationType.Participating}
                        zoomMeetingType={ZoomMeetingType.Phone}
                    />
                );
            });
            const phoneOption = screen.getByText('Dial-in number');
            fireEvent.click(phoneOption);
            const callMeOption = await waitFor(() => screen.getByText('Call me'));
            await actAndFlush(() => {
                fireEvent.click(callMeOption);
            });
            screen.getByText('Your phone number');
        });

        test('when participation type is "Call me" and meeting type is web, do not render participating fields', () => {
            renderWithProvider(<ConnectionDetails {...props} zoomMeetingType={ZoomMeetingType.Web} />);
            expect(screen.queryByText('Call me')).toBeNull();
            expect(screen.queryByText('Your phone number')).toBeNull();
        });

        test('when participation type is not "Call me", do not render phone number input', () => {
            renderWithProvider(<ConnectionDetails {...props} participationType={ParticipationType.NotParticipating} />);
            expect(screen.queryByText('Call me')).toBeNull();
            expect(screen.queryByText('Your phone number')).toBeNull();
        });

        test('when meeting type is web and connectUrl is not set, render an error', () => {
            renderWithProvider(
                <ConnectionDetails
                    {...props}
                    connectUrl={''}
                    errors={{ connectUrl: 'Required' }}
                    zoomMeetingType={ZoomMeetingType.Web}
                />
            );
            const webOption = screen.getByText('Web URL');
            fireEvent.click(webOption);
            expect(screen.queryByPlaceholderText('https://zoom.us/j/8881234567?pwd=Ya1b2c3d4e5')).toBeInTheDocument();
            screen.getByText('Required');
        });

        test('when meeting type is web and connectUrl is invalid, render an error', () => {
            renderWithProvider(
                <ConnectionDetails
                    {...props}
                    connectUrl={'www.test'}
                    errors={{ connectUrl: 'Must be a valid url starting with http or https' }}
                    zoomMeetingType={ZoomMeetingType.Web}
                />
            );
            const webOption = screen.getByText('Web URL');
            fireEvent.click(webOption);
            expect(screen.queryByPlaceholderText('https://zoom.us/j/8881234567?pwd=Ya1b2c3d4e5')).toBeInTheDocument();
            screen.getByText('Must be a valid url starting with http or https');
        });

        test('when meeting type is phone and connectPhoneNumber is not set, render an error', async () => {
            await actAndFlush(() => {
                renderWithProvider(
                    <ConnectionDetails
                        {...props}
                        connectPhoneNumber={''}
                        errors={{ connectPhoneNumber: 'Required' }}
                        zoomMeetingType={ZoomMeetingType.Phone}
                    />
                );
            });
            const phoneOption = screen.getByText('Dial-in number*');
            fireEvent.click(phoneOption);
            expect(screen.queryByPlaceholderText('(888)-123-4567')).toBeInTheDocument();
            screen.getByText('Required');
        });

        test('when meeting type is phone and connectAccessId is not set, render an error', async () => {
            await actAndFlush(() => {
                renderWithProvider(
                    <ConnectionDetails
                        {...props}
                        connectAccessId={''}
                        errors={{ connectAccessId: 'Required' }}
                        zoomMeetingType={ZoomMeetingType.Phone}
                    />
                );
            });
            const phoneOption = screen.getByText('Dial-in number*');
            fireEvent.click(phoneOption);
            expect(screen.queryByPlaceholderText('1234567890')).toBeInTheDocument();
            screen.getByText('Required');
        });

        test('when meeting type is phone and connectPin is invalid, render an error', async () => {
            await actAndFlush(() => {
                renderWithProvider(
                    <ConnectionDetails
                        {...props}
                        connectPin="12345"
                        errors={{ connectPin: 'Must only contain numbers or #' }}
                        zoomMeetingType={ZoomMeetingType.Phone}
                    />
                );
            });
            const phoneOption = screen.getByText('Dial-in number*');
            fireEvent.click(phoneOption);
            expect(screen.queryByPlaceholderText('(888)-123-4567')).toBeInTheDocument();
            expect(screen.queryByDisplayValue('12345')).toBeInTheDocument();
            screen.getByText('Must only contain numbers or #');
        });

        test('when meeting type is phone, participation type is "Call me", and onConnectDialNumber is not set, render an error', async () => {
            await actAndFlush(() => {
                renderWithProvider(
                    <ConnectionDetails
                        {...props}
                        onConnectDialNumber=""
                        errors={{ onConnectDialNumber: 'Required when selecting "Call me" option' }}
                        participationType={ParticipationType.Participating}
                        zoomMeetingType={ZoomMeetingType.Phone}
                    />
                );
            });
            const phoneOption = screen.getByText('Dial-in number*');
            fireEvent.click(phoneOption);
            const callMeOption = await waitFor(() => screen.getByText('Call me'));
            await actAndFlush(() => {
                fireEvent.click(callMeOption);
            });
            screen.getByText('Your phone number');
            screen.getByText('Required when selecting "Call me" option');
        });
    });

    describe('when connection type is Google Meet', () => {
        const googleProps = {
            ...props,
            connectionType: ConnectionType.GoogleMeet,
        };

        test('renders fields for Google Meet', async () => {
            await actAndFlush(() => renderWithProvider(<ConnectionDetails {...googleProps} />));
            screen.getByText('Dial-in number*');
            expect(screen.queryByPlaceholderText('(888)-123-4567')).toBeInTheDocument();
            expect(screen.queryByDisplayValue(props.connectPin)).toBeInTheDocument();
            screen.getByText('Call me');
            screen.getByText('Set it & forget it');
        });

        test('when connectPin is invalid, render an error', async () => {
            await actAndFlush(() => {
                renderWithProvider(
                    <ConnectionDetails
                        {...googleProps}
                        connectPin="test"
                        errors={{ connectPin: 'Must only contain numbers or #' }}
                    />
                );
            });
            const phoneOption = screen.getByText('Dial-in number*');
            fireEvent.click(phoneOption);
            expect(screen.queryByPlaceholderText('(888)-123-4567')).toBeInTheDocument();
            expect(screen.queryByDisplayValue('test')).toBeInTheDocument();
            screen.getByText('Must only contain numbers or #');
        });

        test('when participation type is "Call me" and onConnectDialNumber is not set, render an error', async () => {
            await actAndFlush(() => {
                renderWithProvider(
                    <ConnectionDetails
                        {...googleProps}
                        onConnectDialNumber=""
                        errors={{ onConnectDialNumber: 'Required when selecting "Call me" option' }}
                        participationType={ParticipationType.Participating}
                    />
                );
            });
            const phoneOption = screen.getByText('Dial-in number*');
            fireEvent.click(phoneOption);
            const callMeOption = await waitFor(() => screen.getByText('Call me'));
            await actAndFlush(() => {
                fireEvent.click(callMeOption);
            });
            screen.getByText('Your phone number');
            screen.getByText('Required when selecting "Call me" option');
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

        test('when connectUrl is not set, render an error', () => {
            renderWithProvider(
                <ConnectionDetails {...webcastProps} connectUrl={''} errors={{ connectUrl: 'Required' }} />
            );
            expect(screen.queryByPlaceholderText('https://zoom.us/j/8881234567?pwd=Ya1b2c3d4e5')).toBeInTheDocument();
            screen.getByText('Required');
        });

        test('when connectUrl is invalid, render an error', () => {
            renderWithProvider(
                <ConnectionDetails
                    {...webcastProps}
                    connectUrl={'www.test'}
                    errors={{ connectUrl: 'Must be a valid url starting with http or https' }}
                />
            );
            expect(screen.queryByPlaceholderText('https://zoom.us/j/8881234567?pwd=Ya1b2c3d4e5')).toBeInTheDocument();
            screen.getByText('Must be a valid url starting with http or https');
        });
    });

    describe('when connection type is Phone Number', () => {
        const phoneNumberProps = {
            ...props,
            connectionType: ConnectionType.Phone,
        };

        test('renders fields for Phone Number', async () => {
            await actAndFlush(() => renderWithProvider(<ConnectionDetails {...phoneNumberProps} />));
            screen.getByText('Dial-in number*');
            expect(screen.queryByPlaceholderText('(888)-123-4567')).toBeInTheDocument();
            expect(screen.queryByPlaceholderText('1234567890')).toBeInTheDocument();
            expect(screen.queryByDisplayValue(props.connectPin)).toBeInTheDocument();
            screen.getByText('Call me');
            screen.getByText('Set it & forget it');
        });

        test('when connectPin is invalid, render an error', async () => {
            await actAndFlush(() => {
                renderWithProvider(
                    <ConnectionDetails
                        {...phoneNumberProps}
                        connectPin="12345"
                        errors={{ connectPin: 'Must only contain numbers or #' }}
                    />
                );
            });
            const phoneOption = screen.getByText('Dial-in number*');
            fireEvent.click(phoneOption);
            expect(screen.queryByPlaceholderText('(888)-123-4567')).toBeInTheDocument();
            expect(screen.queryByDisplayValue('12345')).toBeInTheDocument();
            screen.getByText('Must only contain numbers or #');
        });
    });
});
