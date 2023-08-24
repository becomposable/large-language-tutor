import OpenAI from "openai";
import { IConversation } from "../models/conversation.js";
import { CompletionBase } from "../openai/index.js";

export default class ExplainCompletion extends CompletionBase<ExplainCompletion> {

    content: string
    messageId?: string;

    constructor(conversation: IConversation, content: string, messageId?: string) {
        super(conversation.study_language, conversation.user_language);
        this.content = content;
        this.messageId = messageId;
    }

    getAppInstruction(): string {
        return `You are a language tutor. The user is learning ${this.studyLanguage} and is speaking ${this.userLanguage}.
        Please answer in ${this.userLanguage}. 
        Reply with a translation, an explanation of the structure of the sentence if it's a sentence or a definition of the word if it's a word.
        If the content has mistake, please correct it and explain the mistake.
        Please use simple words and short sentences.
        Finish with an advice on how to use or how to answer to the content.`;
    }

    getUserMessages(): Promise<OpenAI.Chat.ChatCompletionMessage[]> {

        const userMsg: OpenAI.Chat.ChatCompletionMessage = {
            role: "user",
            content: `
            Please explain the following:
            ${this.content}
            `,
        };

        return Promise.resolve([userMsg]);
    }

}