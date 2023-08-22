import { createContext, useContext, useState } from "react";
import FetchClient from "../fetch-client";
import { API_BASE_URL } from "../env";

export interface IUserSession {
    user: any; //TODO
    client: FetchClient;
}

const UserSessionContext = createContext<IUserSession>({
    user: null, client: new FetchClient(API_BASE_URL)
});

interface UserSessionProviderProps {
    children: React.ReactNode | React.ReactNode[];
}
export function UserSessionProvider({ children }: UserSessionProviderProps) {
    const [session] = useState<IUserSession>({
        user: null,
        client: new FetchClient(API_BASE_URL)
    });
    return (
        <UserSessionContext.Provider value={session}>{children}</UserSessionContext.Provider>
    )
}

export function useUserSession() {
    return useContext(UserSessionContext);
}
