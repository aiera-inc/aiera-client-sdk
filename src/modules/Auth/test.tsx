import React, { FormEvent } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AuthUI } from '.';

const defaultProps = {
    user: undefined,
    loading: false,
    error: undefined,
    authForm: { email: '', password: '' },
    setAuthForm: () => undefined,
    login: () => undefined,
    logout: () => undefined,
};

describe('AuthUI', () => {
    test('renders a loading state', () => {
        render(<AuthUI {...defaultProps} loading />);
        screen.getByText('Loading...');
    });

    test('renders the user and a logout button if logged in', () => {
        const logout = jest.fn();
        render(<AuthUI {...defaultProps} user={{ id: 'id', firstName: 'Test', lastName: 'User' }} logout={logout} />);
        fireEvent.click(screen.getByText('Logout'));
        expect(logout).toHaveBeenCalled();
    });

    test('renders a loging form if the user is logged out', () => {
        const login = jest.fn((e: FormEvent) => e.preventDefault());
        const setAuthForm = jest.fn();
        render(<AuthUI {...defaultProps} setAuthForm={setAuthForm} login={login} />);

        fireEvent.change(screen.getByTestId('auth-email'), { target: { value: 'test@example.com' } });
        expect(setAuthForm).toHaveBeenCalledWith({ email: 'test@example.com', password: '' });

        fireEvent.change(screen.getByTestId('auth-password'), { target: { value: 'password' } });
        expect(setAuthForm).toHaveBeenCalledWith({ email: '', password: 'password' });

        fireEvent.click(screen.getByText('Login'));
        expect(login).toHaveBeenCalled();
    });
});
