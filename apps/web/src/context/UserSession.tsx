import { createContext, useContext, useEffect, useState } from "react";
import FetchClient from "../fetch-client";
import Env from "../env";
import { firebaseAuth } from "../auth/firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import { IUser } from "../types";
import { signOut } from "firebase/auth"

export interface IUserSession {
    user?: IUser;
    client: FetchClient;
    signOut: () => void;
    isLoading: boolean;
}

function linkUser(client: FetchClient, firebaseUser: User): Promise<IUser> {
    return client.clone(Env.AUTH_BASE_URL).post('/link', {
        payload: {
            externalId: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName
        }
    });
}

function _signOut() {
    signOut(firebaseAuth);
}

const UserSessionContext = createContext<IUserSession>({
    user: undefined, client: new FetchClient(Env.API_BASE_URL), signOut: _signOut, isLoading: false
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
    });

    useEffect(() => {
        return onAuthStateChanged(firebaseAuth, (firebaseUser) => {
            if (firebaseUser) {
                firebaseUser.getIdTokenResult(false).then((token) => {
                    session.client.headers.authorization = `Bearer ${token.token}`;
                    return linkUser(session.client, firebaseUser)
                }).then(user => {
                    setSession({ ...session, user: user, isLoading: false });
                }).catch(err => {
                    console.error('Session state change error', err);
                    setSession({ ...session, user: undefined, isLoading: false });
                });
            } else {
                // anonymous user
                delete session.client.headers.authorization;
                setSession({ ...session, user: undefined, isLoading: false });
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
