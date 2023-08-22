import OpenAI from 'openai';
import { Stream } from 'openai/streaming';
import logger from '../logger.js';
import { IConversation } from '../models/conversation.js';
import { IMessage, findPreviousMessages } from '../models/message.js';

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});

export function requestChatCompletion(messages: OpenAI.Chat.ChatCompletionMessage[], stream = false) {
    return openai.chat.completions.create({
        stream: stream,
        model: "gpt-4",
        messages: messages,
        temperature: 0.5,
        n: 1,
        max_tokens: 2048,
    });
}

export function requestCompletion(prompt: string, stream = false) {

    return openai.completions.create({
        stream: stream,
        model: 'text-davinci-003',
        prompt: prompt,
        temperature: 0.5,
        n: 1,
        max_tokens: 2048,
        stop: ['\n']
    });

}

/** Abstract class defining the base methods of a prompt
 * Implement and extend this class to create Prompt that can be used to
 * Generate Prompts for use case and LLMs.
 * Type properly the constructor to force passing the right arguments
 */
abstract class Prompt<T extends Prompt<T>> {

    studyLanguage: string;
    userLanguage: string;
    userInterests?: string[];
    //TODO the conversation has a user reference sop we can fetch the user info with a populate
    userAge?: number;
    userLevel?: string;
    conversation: IConversation;

    constructor(conversation: IConversation) {
        this.conversation = conversation;
        this.studyLanguage = conversation.studyLanguage;
        this.userLanguage = conversation.userLanguage;
    }

}

export class ChatCompletion extends Prompt<ChatCompletion> {

    constructor(conversation: IConversation) {
        super(conversation);
        this.userLevel = "JPLT4";

    }

    async buildMessages(newMessage: IMessage, limit = 20): Promise<OpenAI.Chat.ChatCompletionMessage[]> {
        let sysMsg = `
        You are a language tutor. The user is learning ${this.studyLanguage} and is speaking ${this.userLanguage}.
        You are chatting with this user to help him/her practice and learn ${this.studyLanguage}.
        Always make sure your messages are engaging and helpful.
        `;

        if (this.userLevel) {
            sysMsg = sysMsg + `The user is at level ${this.userLevel} in ${this.studyLanguage}. Please only use words and structure that should be accessible for this level in the language.`;
        }

        if (this.userAge) {
            sysMsg = sysMsg + `The user is ${this.userAge} years old. Please use a language appropriate for that age and make sure topics are relevant.`;
        }

        if (this.userInterests) {
            sysMsg = sysMsg + `The user is interested in ${this.userInterests.join(",")}. Please use a language appropriate for that age and make sure topics are relevant.`;
        }

        const latestMessages = await findPreviousMessages(newMessage, limit);
        const messages: OpenAI.Chat.ChatCompletionMessage[] = [];
        messages.push({
            role: "system",
            content: sysMsg,
        })
        for (let i = latestMessages.length - 1; i >= 0; i--) {
            const m = latestMessages[i];
            messages.push({ role: "user", content: m.question });
            messages.push({ role: "assistant", content: m.answer || null });
        }
        messages.push({
            role: "user",
            content: newMessage.question,
        })

        return messages;
    }

    async execute(newMessage: IMessage, limit = 20): Promise<OpenAI.Chat.Completions.ChatCompletion> {
        const messages = await this.buildMessages(newMessage, limit);
        logger.log(messages, "Executing a new chat Request");
        return await requestChatCompletion(messages, false) as OpenAI.Chat.Completions.ChatCompletion;
    }

    async stream(newMessage: IMessage, limit = 20): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
        const messages = await this.buildMessages(newMessage, limit);
        logger.log(messages, "Executing a new chat Request in stream mode");
        return requestChatCompletion(messages, true) as Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>>;
    }

}

export class ExplainCompletion extends Prompt<ExplainCompletion> {

    content: string

    constructor(conversation: IConversation, content: string) {
        super(conversation);
        this.content = content;
    }

    getPrompt(): string {
        const msg = `
        You are a language tutor. The user is learning ${this.studyLanguage} and is speaking ${this.userLanguage}.
        Please answer in ${this.userLanguage}. 
        Reply with a translation, an explanation of the structure of the sentence if it's a sentence or a definition of the word if it's a word.
        Please use simple words and short sentences.
        Reply using the format below:
        ---
        Content: content to be explained
        Translation: translation of the content in ${this.userLanguage}
        Explanation: 
        ---

        Taking account the previous, please explain the following between the %%% symbols:
        %%%${this.content}%%%
        `;
        return msg;
    }

    async execute(): Promise<string> {
        const prompt = this.getPrompt();
        const result = await requestCompletion(prompt, false) as OpenAI.Completions.Completion;
        return result.choices[0].text;
    }
}