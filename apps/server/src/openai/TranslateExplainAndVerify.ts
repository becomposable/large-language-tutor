import OpenAI from "openai";
import { CompletionBase } from "../openai/index.js";

export default class VerifyAndFixCompletion extends CompletionBase<VerifyAndFixCompletion> {

    content: string
    context: string | undefined;

    constructor(studyLaguage: string, userLanguage: string, content: string, context?: string) {
        super(studyLaguage, userLanguage);
        this.content = content;
        this.context = context;
    }

    getAppInstruction(): string {
        return `You are a language assistant.
        The user is learning ${this.studyLanguage} and is speaking ${this.userLanguage}.
        Please answer in ${this.userLanguage}.
        The user wants to verify that what he wants to say / write is correct.
        The user will give you a sentence and optionally a context, which you can use to judge if the language level is appropriate.
        Translate the content, say wether it's natural or not, and explain why if it's not.
        Fix typos and mistakes if any.
        Don't over do it, stay concise and to the point. If the content is correct and natural, just say so.`;
    }

    getUserMessages(): Promise<OpenAI.Chat.ChatCompletionMessage[]> {

        const userMsg: OpenAI.Chat.ChatCompletionMessage = {
            role: "user",
            content: `
            <content>
            ${this.content}
            </content>
            `,
        };

        if (this.context) {
            userMsg.content += `
            <context>
            ${this.context}
            </context>
            `;
        }

        return Promise.resolve([userMsg]);
    }

}