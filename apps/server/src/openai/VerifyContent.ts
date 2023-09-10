import OpenAI from "openai";
import { CompletionBase } from "./index.js";

export const VerifyContentSchema = {
    "type": "object",
    "properties": {
        "is_correct": {
            "type": "boolean",
            "description": "Is the content correct and natural?"
        },
        "correction": {
            "type": "string",
            "description": "If the content is not correct, correct it here"
        },
        "importance": {
            "type": "string",
            "enum": ["low", "medium", "high"],
            "description": "How important is the mistake? High means the sentence is not understandable, medium means the sentence is understandable but not natural, low means the sentence is natural but not perfect"
        },
        "explanation": {
            "type": "string",
            "description": "Explain the mistake, in a short sentence, to the point"
        },
    },
    "required": ["is_correct", "importance"]
}

export default class VerifyContentCompletion extends CompletionBase<VerifyContentCompletion> {

    content: string
    context?: string;

    constructor(userLanguage: string, content: string, context?: string) {
        super(undefined, userLanguage, VerifyContentSchema);
        this.content = content;
        this.context = context;
    }

    getAppInstruction(): string {
        let msg = `You are a language tutor.\n`;
        if (this.studyLanguage) msg += `The user is learning ${this.studyLanguage}.\n`

        msg += "The user is asking you to verify and explain the content starting with <content>.\n"
        msg += `If the sentence is correct simply put is_correct to true.\n`
        msg += `If the sentence is not correct, correct it.\n`

        return msg;
    }

    getUserMessages(): Promise<OpenAI.Chat.ChatCompletionMessage[]> {

        const userMsg: OpenAI.Chat.ChatCompletionMessage = {
            role: "user",
            content: `
            <content>
            ${this.content}
            <end>
            `,
        };

        return Promise.resolve([userMsg]);
    }

}