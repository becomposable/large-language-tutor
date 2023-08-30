import OpenAI from 'openai';
import { Stream } from 'openai/streaming';
import logger from '../logger.js';
import { IConversation } from '../models/conversation.js';
import { IMessage, MessageStatus, findPreviousMessages } from '../models/message.js';
import { validate } from 'json-schema';

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});

/** Abstract class defining the base methods of a prompt
 * Implement and extend this class to create Prompt that can be used to
 * Generate Prompts for use case and LLMs.
 * Type properly the constructor to force passing the right arguments
 */
export abstract class CompletionBase<T extends CompletionBase<T>> {

    studyLanguage: string;
    userLanguage: string;
    schema?: Object;
    userInterests?: string[];
    //TODO the conversation has a user reference sop we can fetch the user info with a populate
    userAge?: number;
    userLevel?: string;

    constructor(study_language?: string, user_language?: string, schema?: Object) {
        this.studyLanguage = study_language ?? 'Japanese';
        this.userLanguage = user_language ?? 'English';
        this.schema = schema;
    }

    getSafetyMsg(): string {
        const msg = `
        The user is at level ${this.userLevel} in ${this.studyLanguage}.
        Please only use words and structure that should be accessible for this level in the language.`;

        return msg;
    }


    abstract getAppInstruction(): string | null;

    abstract getUserMessages(): Promise<OpenAI.Chat.ChatCompletionMessage[] | undefined>;

    async buildMessages(): Promise<OpenAI.Chat.ChatCompletionMessage[]> {

        const messages = [];

        const disclaimerMsg: OpenAI.Chat.ChatCompletionMessage = {
            role: "system",
            content: this.getSafetyMsg()
        };
        if (disclaimerMsg.content) messages.push(disclaimerMsg);

        const sysMsg: OpenAI.Chat.ChatCompletionMessage = {
            role: "system",
            content: this.getAppInstruction()
        }
        if (sysMsg.content) messages.push(sysMsg);

        const userMsg = await this.getUserMessages();

        if (userMsg) userMsg.forEach(m => {
            if (m.content) messages.push(m)
        });

        return Promise.resolve(messages);

    }

    async execute(): Promise<any> {
        const messages = await this.buildMessages();
        logger.log(messages, "Executing a new chat Request");
        const start = Date.now();
        const result = await this.requestChatCompletion(messages, false) as OpenAI.Chat.Completions.ChatCompletion;
        const duration = Date.now() - start;
        logger.log(`Chat Result received in ${duration / 1000}s`, result);

        //if no schema, return content
        if (!this.schema) {
            return result.choices[0]?.message.content as string;
        }

        //we have a schema: get the content and return after validation
        const data = result.choices[0]?.message.function_call?.arguments as any;
        if (!data) {
            logger.error("Response is not valid", result);
            throw new Error("Response is not valid: no data");
        }

        const dataObject = JSON.parse(data);
        if (!dataObject) {
            logger.error("Response is not valid", data);
            throw new Error("Response is not valid: cannot parse data");
        };

        //validate response if schema is defined
        if (!this.validateResponse(dataObject)) {
            logger.error("Response is not valid", data);
            throw new Error("Response is not valid");
        }

        return dataObject;
    }

    //validate the response against the schema if any
    validateResponse(dataObject: Object): boolean {

        if (!this.schema) {
            throw new Error("No schema defined");
        };

        const valid = validate(dataObject, this.schema);

        if (valid.valid) {
            return true;
        } else {
            console.log("XXXXXXX VALIDATION ERROR XXXXXXX", valid.errors, dataObject);
            return false;
        }

    }



    async stream(): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
        const messages = await this.buildMessages();
        logger.log(messages, "Executing a new chat Request in stream mode");
        return this.requestChatCompletion(messages, true) as Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>>;
    }


    async requestChatCompletion(messages: OpenAI.Chat.ChatCompletionMessage[], stream = false, temperature = 0.5) {

        console.log(messages, "Requesting chat completion")

        const functions = this.schema ? [{
            name: "format_output",
            parameters: this.schema as any
        }] : undefined;

        //if we're streaming, return right away, don't pass functions
        if (stream) {
            return openai.chat.completions.create({
                stream: stream,
                model: "gpt-4",
                messages: messages,
                temperature: temperature,
                n: 1,
                max_tokens: 2048,
            });
        }

        const res = await openai.chat.completions.create({
            stream: stream,
            model: "gpt-4",
            messages: messages,
            temperature: temperature,
            n: 1,
            max_tokens: 2048,
            functions: functions,
            function_call: this.schema ? { name: "format_output" } : undefined
        });

        return res;

    }
}

export class ConversationCompletion extends CompletionBase<ConversationCompletion> {

    lastMessage?: IMessage;
    limit: number;
    conversation: IConversation;

    constructor(conversation: IConversation, limit = 50) {
        super(conversation.study_language, conversation.user_language);
        this.conversation = conversation;

        this.limit = limit;

        //TODO pivk the user level from the user profile
        this.userLevel = "JPLT4";
    }

    beforeMessage(message: IMessage) {
        this.lastMessage = message;
        return this;
    }

    getAppInstruction(): string {

        return `
        You are a language tutor. The user is learning ${this.studyLanguage} and is speaking ${this.userLanguage}.
        You are chatting with this user to help him/her practice and learn ${this.studyLanguage}.
        Always make sure your messages are engaging and helpful.
        Make sure that when you repond, you always entince the user to answer back.
        `;

    }

    async getUserMessages(): Promise<OpenAI.Chat.ChatCompletionMessage[]> {

        const latestMessages = await findPreviousMessages(this.conversation._id, { limit: this.limit, status: MessageStatus.active, last: this.lastMessage });
        const messages: OpenAI.Chat.ChatCompletionMessage[] = [];

        for (let i = latestMessages.length - 1; i >= 0; i--) {
            const m = latestMessages[i];
            messages.push({ role: m.origin, content: m.content });
        }

        return messages;
    }

}