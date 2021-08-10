import { useMutation, useQuery } from 'urql';
import { GQLHook, User } from 'types';

interface UserQueryData {
    currentUser?: User;
}

interface UserHook {
    user?: User;
    login: (args: { email: string; password: string }) => void;
}

export function useUser(): GQLHook & UserHook {
    const [result, refetch] = useQuery<UserQueryData>({
        query: `
            query {
                currentUser {
                    id
                    firstName
                    lastName
                }
            }
        `,
    });
    const { data, fetching, error } = result;

    const [_, login] = useMutation(`
        mutation($email: String, $password: String) {
            login(email: $email, password: $password) {
                success
                user {
                    id
                    firstName
                    lastName
                }
            }
        }
    `);

    return {
        user: data?.currentUser,
        loading: fetching,
        error,
        refetch,
        login,
    };
}
