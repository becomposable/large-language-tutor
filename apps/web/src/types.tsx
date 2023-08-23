export enum Languages {
    Japanese = "Japanese",
    English = "English"
}

export interface IMessage {
    id: string;
    content: string;
    role: string;
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
