export interface User {
    id: string;
    externalId: string; // firebaseId
    email: string;
    name: string; // displayName in firebase
    language?: string; // lamnguage code 
    level?: number;
    phone?: string;
    picture?: string; // photo url if any
    sign_in_provider?: string;
    avatar?: string; // avatar version TODO remove?
    locale?: string;
    timeZone?: string;
    lastAccess?: Date;
    created: Date;
    modified: Date;
    last_selected_account?: string // | ObjectIdType; // use the ObjectIdType type
}

export interface Account {
    id: string;
    name: string;
    owner: string// | ObjectIdType;
    members: { 
        user: string // | ObjectIdType, 
        role: string,
    disabled: boolean }[],
    created: Date;
    modified: Date;
}
