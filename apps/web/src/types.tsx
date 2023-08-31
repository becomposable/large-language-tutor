export enum MessageOrigin {
    user = 'user',
    assistant = 'assistant',
    system = 'system',
}

export enum MessageStatus {
    created = 'created', // created but completion must be started by the user (through streaming)
    pending = 'pending', // completion is pending
    active = 'active', // completion is done
}

export enum Languages {
    Japanese = "JA",
    English = "EN",
    French = "FR",
    Spanish = "SP",
    Portugese = "PT",
    Italian = "IT",
    German = "DE",
    Dutch = "NL",
    Romanian = "RO"
}

export interface IMessage {
    id: string;
    conversation: string;
    status: MessageStatus;
    content: string;
    origin: MessageOrigin;
    created: string;
}

export interface IConversation {
    title?: string,
    waiting_for_completion: boolean,
    study_language: Languages,
    user_language: Languages,
    created: string,
    updated: string,
    id: string
}

export interface IStory {
    language: string,
    created: string,
    id: string,
    status: MessageStatus,
    content?: string,
    title?: string,
    style?: string,
    level?: string,
    topic?: string,
}

export interface IExplanation {
    readonly id: string,
    created: string,
    topic: string,
    content?: string,
    conversation?: string,
    message?: string
    user?: string
}


export interface IUser {
    id: string;
    externalId: string;
    email: string;
    name: string;
    picture?: string;
    language?: string;
    phone?: string;
    sign_in_provider?: string;
}
