import OpenAI from "openai";
import { CompletionBase } from "../openai/index.js";

export default class ExplainCompletion extends CompletionBase<ExplainCompletion> {

    content: string
    messageId?: string;
    context?: string;

    constructor(studyLaguage: string, userLanguage: string, content: string, messageId?: string, context?: string) {
        super(studyLaguage, userLanguage);
        this.content = content;
        this.messageId = messageId;
        this.context = context;
    }

    getAppInstruction(): string {
        return `You are a language tutor and assistant.
        The user is learning ${this.studyLanguage} and is speaking ${this.userLanguage}.
        Please answer in ${this.userLanguage}. 
        Reply with a translation, an explanation of the structure of the sentence if it's a sentence or a definition of the word if it's a word.
        If the content has mistake, please correct it and explain the mistake.
        Please use simple words and short sentences.
        Express if the sentence is natural or not and why, if it's not propose a better way.
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