import React from 'react';
import { screen } from '@testing-library/react';
import { ScheduleMeridiem, ScheduleType } from '@aiera/client-sdk/modules/RecordingForm/types';
import { renderWithProvider } from '@aiera/client-sdk/testUtils';
import { Scheduling } from './index';

describe('Scheduling', () => {
    const connectOffsetSeconds = 0;
    const errors = {};
    const onChange = jest.fn();
    const scheduleDate = new Date();
    const scheduleMeridiem = ScheduleMeridiem.AM;

    test('renders scheduling fields', () => {
        renderWithProvider(
            <Scheduling
                connectOffsetSeconds={connectOffsetSeconds}
                errors={errors}
                onBlur={onChange}
                onChange={onChange}
                scheduleDate={scheduleDate}
                scheduleMeridiem={scheduleMeridiem}
            />
        );
        screen.getByText('Scheduling');
        screen.getByText('Now');
        screen.getByText('In the future');
    });

    test('when scheduleType is now, do not show date & time fields', () => {
        renderWithProvider(
            <Scheduling
                connectOffsetSeconds={connectOffsetSeconds}
                errors={errors}
                onBlur={onChange}
                onChange={onChange}
                scheduleDate={scheduleDate}
                scheduleMeridiem={scheduleMeridiem}
                scheduleType={ScheduleType.Now}
            />
        );
        expect(screen.queryByText('Date & Time')).toBeNull();
    });

    test('when scheduleType is future, show date & time fields', () => {
        renderWithProvider(
            <Scheduling
                connectOffsetSeconds={connectOffsetSeconds}
                errors={errors}
                onBlur={onChange}
                onChange={onChange}
                scheduleDate={scheduleDate}
                scheduleMeridiem={scheduleMeridiem}
                scheduleType={ScheduleType.Future}
            />
        );
        screen.getByText('Date & Time');
        expect(screen.queryByPlaceholderText('10:00')).toBeInTheDocument();
        screen.getByText('AM');
    });

    test('when scheduleType is future and scheduleTime is not set, render an error', () => {
        renderWithProvider(
            <Scheduling
                connectOffsetSeconds={connectOffsetSeconds}
                errors={{ scheduleTime: 'Required' }}
                onBlur={onChange}
                onChange={onChange}
                scheduleDate={scheduleDate}
                scheduleMeridiem={scheduleMeridiem}
                scheduleType={ScheduleType.Future}
            />
        );
        screen.getByText('Date & Time');
        expect(screen.queryByPlaceholderText('10:00')).toBeInTheDocument();
        screen.getByText('AM');
        screen.getByText('Required');
    });

    test('when scheduleType is future and scheduleTime is not valid, render an error', () => {
        renderWithProvider(
            <Scheduling
                connectOffsetSeconds={connectOffsetSeconds}
                errors={{ scheduleTime: 'Invalid' }}
                onBlur={onChange}
                onChange={onChange}
                scheduleDate={scheduleDate}
                scheduleMeridiem={scheduleMeridiem}
                scheduleTime="00"
                scheduleType={ScheduleType.Future}
            />
        );
        screen.getByText('Date & Time');
        expect(screen.queryByPlaceholderText('10:00')).toBeInTheDocument();
        screen.getByText('AM');
        screen.getByText('Invalid');
    });
});
