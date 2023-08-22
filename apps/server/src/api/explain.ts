import { Resource, post } from "@koa-stack/server";
import { Context } from "koa";
import ServerError from "../errors/ServerError.js";
import { ConversationModel, IConversation } from "../models/conversation.js";
import { Prompt } from "../openai/index.js";
import OpenAI from "openai";


export class ExplainResource extends Resource {

    @post('/')
    async explain(ctx: Context) {
        const payload = (await ctx.payload).json;
        const content = payload.content;
        const messageId = payload.messageId ?? undefined;

        if (!payload.conversation || !payload.content) {
            throw new ServerError("Missing conversation or content", 400);
        }

        const conversation = await ConversationModel.findById(payload.conversation);
        if (!conversation) {
            throw new ServerError(`Conversation with id ${payload.conversation} not found`, 404);
        }

        //not streaming, get the thing
        const explainRequest = new ExplainCompletion(conversation, content, messageId);
        const result = await explainRequest.execute();
        const messages = result.choices.map(c => c.message.content);

        ctx.body = messages;
        ctx.status = 201;
        
    }

}



class ExplainCompletion extends Prompt<ExplainCompletion> {

    content: string
    messageId?: string;

    constructor(conversation: IConversation, content: string, messageId?: string) {
        super(conversation);
        this.content = content;
        this.messageId = messageId;
    }

    buildMessages(): Promise<OpenAI.Chat.ChatCompletionMessage[]> {
        const sysMsg: OpenAI.Chat.ChatCompletionMessage = {
            role: "system",
            content: `You are a language tutor. The user is learning ${this.studyLanguage} and is speaking ${this.userLanguage}.
            Please answer in ${this.userLanguage}. 
            Reply with a translation, an explanation of the structure of the sentence if it's a sentence or a definition of the word if it's a word.
            Please use simple words and short sentences.
            Answer with the following template:
            ---
            Translation:
            Explanation:
            ---
            `
        };

        const userMsg: OpenAI.Chat.ChatCompletionMessage = {
            role: "user",
            content: `
            Please explain the following:
            ${this.content}
            `,
        };

        const messages: OpenAI.Chat.ChatCompletionMessage[] = [];
        messages.push(sysMsg);
        messages.push(userMsg);

        return Promise.resolve(messages);
    }

}