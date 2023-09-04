import { Resource, get, post } from "@koa-stack/router";
import SSE from "better-sse";
import { Context } from "koa";
import { ServerError } from "@koa-stack/router";
import { Explanation } from "../models/explanation.js";
import { MessageModel, MessageStatus } from "../models/message.js";
import ExplainCompletion from "../openai/ExplainCompletion.js";
import { jsonDoc, requestAccountId, requestUser } from "./utils.js";


export class ExplainResource extends Resource {


    @get('/:explanationId/stream')
    async streamMessageCompletion(ctx: Context) {
        const explanationId = ctx.params.explanationId;
        const expl = await Explanation.findById(explanationId);

        if (!expl) {
            ctx.throw(404, `Explanation with id ${explanationId} not found`);
        }

        if (expl.status !== MessageStatus.created) {
            ctx.throw(404, `Message with id ${explanationId} must be in created state`);
        }

        const session = await SSE.createSession(ctx.req, ctx.res);
        if (!session.isConnected) {
            throw new ServerError('SSE session not connected', 500);
        }

        expl.status = MessageStatus.pending;
        await expl.save();

        const explRequest = new ExplainCompletion(expl.study_language, expl.user_language, expl.topic, expl.message?.toString());
        const stream = await explRequest.stream();
        const chunks = [];
        for await (const data of stream) {
            const chunk = data.choices[0]?.delta?.content ?? '';
            session.push(chunk);
            chunks.push(chunk);
        }

        expl.content = chunks.join('');
        expl.status = MessageStatus.active;
        await expl.save();

        // send a close event with the crreated document attached
        session.push(jsonDoc(expl), "close");

        ctx.status = 200;
    }

    @get('/:explanationId')
    async getExplanation(ctx: Context) {
        const explanationId = ctx.params.explanationId;
        const expl = await Explanation.findById(explanationId);

        if (!expl) {
            ctx.throw(404, `Explanation with id ${explanationId} not found`);
        }

        ctx.body = jsonDoc(expl);
    }

    @post('/')
    async explain(ctx: Context) {
        const accountId = requestAccountId(ctx);
        const user = await requestUser(ctx);

        const payload = (await ctx.payload).json;
        let topic = payload.content;
        const messageId = payload.messageId ?? undefined;
        const studyLanguage = payload.studyLanguage ?? undefined;
        const userLanguage = payload.userLanguage ?? undefined;
        const blocking = payload.blocking ?? false;

        if (!messageId && !topic) {
            throw new ServerError("Missing conversation message or topic", 400);
        }

        if (!topic) {
            const msg = await MessageModel.findById(messageId).select("content");
            if (!msg) {
                ctx.throw(400, "Message not found");
            }
            topic = msg.content;
        }

        if (!topic) {
            ctx.throw(400, "No topic provided");
        }

        let content: string | undefined = undefined;
        if (blocking) {
            const explainRequest = new ExplainCompletion(studyLanguage, userLanguage, topic, messageId);
            const result = await explainRequest.execute();
            content = result.join(' ');
        }

        const explanation = await Explanation.create({
            status: blocking ? MessageStatus.active : MessageStatus.pending,
            topic: topic,
            content: content,
            message: messageId,
            user: user._id,
            account: accountId,
            user_language: userLanguage,
            study_language: studyLanguage,
        });

        ctx.body = jsonDoc(explanation);

    }

}

