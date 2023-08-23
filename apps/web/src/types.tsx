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
    Japanese = "Japanese",
    English = "English"
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
