import { Resource, get, post } from "@koa-stack/server";
import SSE from "better-sse";
import { Context } from "koa";
import ServerError from "../errors/ServerError.js";
import { ConversationModel, IConversation } from "../models/conversation.js";
import { Explanation } from "../models/explanation.js";
import { jsonDoc } from "./utils.js";
import ExplainCompletion from "../openai/ExplainCompletion.js";


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
        const stream = await explRequest.stream();
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
        const content = await explainRequest.execute();
        explanation.content = content.join(' ');
        explanation.save();

        ctx.body = jsonDoc(explanation);
        ctx.status = 201;

    }

}

