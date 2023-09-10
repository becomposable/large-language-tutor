import OpenAI from "openai";
import { CompletionBase } from "../openai/index.js";

export default class ExplainCompletion extends CompletionBase<ExplainCompletion> {

    content: string
    messageId?: string;
    context?: string;
    verifyOnly: boolean;

    constructor(studyLaguage: string, userLanguage: string, content: string, verifyOnly: boolean = false, messageId?: string, context?: string) {
        super(studyLaguage, userLanguage);
        this.content = content;
        this.messageId = messageId;
        this.verifyOnly = verifyOnly;
        this.context = context;
    }

    getAppInstruction(): string {
        let msg = `You are a language tutor and sparring partner.\n`;
        if (this.studyLanguage) msg += `The user is learning ${this.studyLanguage}.\n`
        if (this.userLanguage) msg += `The user is speaking ${this.userLanguage}. Answer in ${this.userLanguage}.\n`

        if (this.verifyOnly) {
            msg += `
            The user is asking you to verify content starting with <content>.
            Reply by telling the user if the sentence is correct and natural in the language, and a translation if it.
            You don't not need to add anything, and you do not need to quote the content.
            If the sentence is not correct or natural, correct it and explain the mistake.
            Indicate as well the level and language.
            The first line should only be YES or NO.`;
        } else {

            msg += `
            The user is asking you to verify and explain the content starting with <content>.
            Reply with:
            - if the content has a mistake, correct it and explain the mistake, else you don't need to quote the content
            - a translation of the content
            - an explanation of the structure of the sentence by major segments
            - a mention about the language level
            - good options to answer`;
        }

        if (this.studyLanguage === "ja") {
            msg += `
            Important instruction for Japanese: 
              - If the part of the sentence is in Kanji, please write it in Hiragana or Katakana.
              - Never ever use Romaji.`;
        }

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