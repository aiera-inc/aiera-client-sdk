import React, { FC, ReactElement, useState } from 'react';
import { QueryError, User } from 'types';
import { useUser } from 'hooks/user';
import './styles.css';

interface AuthForm {
    email?: string;
    password?: string;
}

interface UIProps {
    user?: Partial<User> | null;
    loading: boolean;
    error?: QueryError;
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

export const Auth: FC<unknown> = (): ReactElement => {
    const { data, error, fetching, login } = useUser();
    const [authForm, setAuthForm] = useState<AuthForm>({
        email: '',
        password: '',
    });

    const submit = () => {
        const { email, password } = authForm;
        if (email && password) {
            void login({ email, password });
        }
    };

    return (
        <AuthUI
            user={data?.currentUser}
            loading={fetching}
            error={error}
            authForm={authForm}
            setAuthForm={setAuthForm}
            submit={submit}
        />
    );
};
