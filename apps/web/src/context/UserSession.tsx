import { createContext, useContext, useEffect, useState } from "react";
import FetchClient from "../fetch-client";
import Env from "../env";
import { firebaseAuth } from "../auth/firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import { IAccount, IUserSessionInfo, IUserWithAccounts } from "../types";
import { signOut } from "firebase/auth"

export interface IUserSession {
    user?: IUserWithAccounts;
    account?: IAccount;
    client: FetchClient;
    signOut: () => void;
    isLoading: boolean;
    refreshUser: () => void;
}

function linkUser(client: FetchClient, firebaseUser: User): Promise<IUserSessionInfo> {
    console.log('Linking user', firebaseUser.uid);
    return client.clone(Env.AUTH_BASE_URL).post('/link', {
        payload: {
            externalId: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName
        }
    });
}

function getUser(client: FetchClient): Promise<IUserSessionInfo> {
    console.log('Getting user');
    return client.clone(Env.AUTH_BASE_URL).get('/me');
}

function _signOut() {
    signOut(firebaseAuth);
}

const UserSessionContext = createContext<IUserSession>({
    user: undefined,
    account: undefined,
    client: new FetchClient(Env.API_BASE_URL),
    signOut: _signOut,
    isLoading: false,
    refreshUser: () => { }
});

interface UserSessionProviderProps {
    children: React.ReactNode | React.ReactNode[];
}
export function UserSessionProvider({ children }: UserSessionProviderProps) {
    const [session, setSession] = useState<IUserSession>({
        user: undefined,
        client: new FetchClient(Env.API_BASE_URL),
        signOut: _signOut,
        isLoading: true,
        refreshUser: () => {
            getUser(session.client).then((userInfo: IUserSessionInfo) => {
                const userWithAccounts = {
                    ...userInfo.user,
                    accounts: userInfo.accounts
                };
                setSession({
                    ...session,
                    user: userWithAccounts,
                    account: userInfo.selected_account,
                    isLoading: false
                });
            }).catch(err => {
                console.error('Error refreshing user', err);
            })
        }
    });

    useEffect(() => {
        return onAuthStateChanged(firebaseAuth, (firebaseUser) => {
            if (firebaseUser) {
                firebaseUser.getIdTokenResult(false).then((token) => {
                    session.client.headers.authorization = `Bearer ${token.token}`;
                    return linkUser(session.client, firebaseUser)
                }).then(userInfo => {
                    const userWithAccounts = {
                        ...userInfo.user,
                        accounts: userInfo.accounts
                    };
                    session.client.headers[Env.ACCOUNT_HEADER] = userInfo.selected_account.id;
                    setSession({
                        ...session,
                        user: userWithAccounts,
                        account: userInfo.selected_account,
                        isLoading: false
                    });
                }).catch(err => {
                    console.error('Session state change error', err);
                    setSession({
                        ...session,
                        user: undefined,
                        account: undefined,
                        isLoading: false
                    });
                });
            } else {
                // anonymous user
                delete session.client.headers.authorization;
                delete session.client.headers[Env.ACCOUNT_HEADER];
                setSession({
                    ...session,
                    user: undefined,
                    account: undefined,
                    isLoading: false
                });
            }
        })
    }, []);

    return (
        <UserSessionContext.Provider value={session}>{children}</UserSessionContext.Provider>
    )
}

export function useUserSession() {
    return useContext(UserSessionContext);
}
