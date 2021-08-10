import React, { FC, ReactElement, useState } from 'react';
import { CombinedError } from 'urql';
import { User } from 'types';
import { useUser } from 'hooks/user';
import './styles.css';

interface AuthForm {
    email?: string;
    password?: string;
}

interface UIProps {
    user?: User;
    loading: boolean;
    error?: CombinedError;
    authForm: AuthForm;
    setAuthForm: (authForm: AuthForm) => void;
    submit: () => void;
}

export const AuthUI: FC<UIProps> = (props: UIProps): ReactElement => {
    const { user, loading, error, authForm, setAuthForm, submit } = props;

    if (error) {
        return <div>Error occurred</div>;
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return (
            <div>
                <div>
                    <input
                        type="text"
                        value={authForm.email}
                        onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    />
                </div>
                <div>
                    <input
                        type="password"
                        value={authForm.password}
                        onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    />
                </div>
                <button type="submit" onClick={submit}>
                    Login
                </button>
            </div>
        );
    }

    return (
        <div>
            {user.firstName} {user.lastName}
        </div>
    );
};

export const Auth: FC<never> = (): ReactElement => {
    const { user, loading, error, login } = useUser();
    const [authForm, setAuthForm] = useState<AuthForm>({
        email: '',
        password: '',
    });

    const submit = () => {
        const { email, password } = authForm;
        if (email && password) {
            login({ email, password });
        }
    };

    return (
        <AuthUI
            user={user}
            loading={loading}
            error={error}
            authForm={authForm}
            setAuthForm={setAuthForm}
            submit={submit}
        />
    );
};
