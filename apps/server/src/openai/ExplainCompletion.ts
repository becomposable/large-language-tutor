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
        let msg = `You are a language tutor and assistant.
        The user is learning ${this.studyLanguage} and is speaking ${this.userLanguage}.
        Please answer in ${this.userLanguage}. 
        Reply with a translation, an explanation of the structure of the sentence, or a correction of the sentence.
        Add a mention about the language level and good options to answer.
        If the sentence isn't natural, correct it.
        If the content has mistake, correct it and explain the mistake.
        Finish with an advice on how to use or how to answer to the content.`;

        if (this.studyLanguage === "JA" || this.studyLanguage === "Japanese") {
            msg += ` Important instruction for Japanese: 
              - If the part of the sentence is in Kanji, please write it in Hiragana or Katakana.
              - Never use Romaji.
            `;
        }

        return msg;

    }

    getUserMessages(): Promise<OpenAI.Chat.ChatCompletionMessage[]> {

        const userMsg: OpenAI.Chat.ChatCompletionMessage = {
            role: "user",
            content: `
            <content to explain>
            ${this.content}
            <end of content>
            `,
        };

        return Promise.resolve([userMsg]);
    }

}