import { Resource, get, post } from "@koa-stack/server";
import SSE from "better-sse";
import { Context } from "koa";
import OpenAI from "openai";
import ServerError from "../errors/ServerError.js";
import { ConversationModel, IConversation } from "../models/conversation.js";
import { Explanation } from "../models/explanation.js";
import { Prompt } from "../openai/index.js";
import { jsonDoc } from "./utils.js";


export class ExplainResource extends Resource {


    @get('/stream/:explanationId')
    async streamMessageCompletion(ctx: Context) {
        const explanationId = ctx.params.explanationId;
        const expl = await Explanation.findById(explanationId).populate<{
            conversation: IConversation,
        }>('conversation');

        if (!expl) {
            ctx.throw(404, `Message with id ${explanationId} not found`);
        }

        const session = await SSE.createSession(ctx.req, ctx.res);
        if (!session.isConnected) {
            throw new ServerError('SSE session not connected', 500);
        }

        const explRequest = new ExplainCompletion(expl.conversation, expl.topic, expl.message?.toString());
        const stream = await explRequest.stream(50);
        const chunks = [];
        for await (const data of stream) {
            const chunk = data.choices[0]?.delta?.content ?? '';
            session.push(chunk);
            chunks.push(chunk);
        }

        expl.content = chunks.join('');
        await expl.save();

        ctx.status = 200;

    }

    @get('/:explanationId')
    async getExplanation(ctx: Context) {
        const explanationId = ctx.params.explanationId;
        const expl = await Explanation.findById(explanationId).populate<{
            conversation: IConversation,
        }>('conversation');

        if (!expl) {
            ctx.throw(404, `Message with id ${explanationId} not found`);
        }

        ctx.body = jsonDoc(expl);
        ctx.status = 200;
    }

    @post('/')
    async explain(ctx: Context) {
        const payload = (await ctx.payload).json;
        const topic = payload.content;
        const messageId = payload.messageId ?? undefined;

        if (!payload.conversation || !payload.content) {
            throw new ServerError("Missing conversation or content", 400);
        }

        const conversation = await ConversationModel.findById(payload.conversation);
        if (!conversation) {
            throw new ServerError(`Conversation with id ${payload.conversation} not found`, 404);
        }

        const explanation = await Explanation.create({
            topic: topic,
            conversation: conversation,
            message: messageId,
            user: conversation.user,
        });

        if (payload.stream) {
            ctx.body = explanation;
            ctx.status = 201;
            return; // we are done, the client will stream the completion
        }

        //not streaming, get the thing
        const explainRequest = new ExplainCompletion(conversation, topic, messageId);
        const result = await explainRequest.execute();
        const content = result.choices.map(c => c.message.content);
        explanation.content = content.join(' ');
        explanation.save();

        ctx.body = jsonDoc(explanation);
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
            If the content has mistake, please correct it and explain the mistake.
            Please use simple words and short sentences.
            Finish with an advice on how to use or how to answer to the content.
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