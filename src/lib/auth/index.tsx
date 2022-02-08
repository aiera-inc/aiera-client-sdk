import React, { createContext, useContext, useMemo, ReactElement, ReactNode } from 'react';

interface AuthContext {
    logout?: () => void;
}

const Context = createContext<AuthContext>({});

export const AuthProvider = ({ children, logout }: { children: ReactNode; logout?: () => void }): ReactElement => {
    const authContext = useMemo(() => ({ logout }), [logout]);
    return <Context.Provider value={authContext}>{children}</Context.Provider>;
};

export const useAuthContext = (): AuthContext => {
    return useContext(Context);
};
