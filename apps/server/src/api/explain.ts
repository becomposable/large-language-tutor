import { Resource, ServerError, get, post } from "@koa-stack/router";
import { VerifyAndExplain } from "@language-tutor/interactions";
import SSE from "better-sse";
import { Context } from "koa";
import logger from "../logger.js";
import { Explanation } from "../models/explanation.js";
import { MessageModel, MessageStatus } from "../models/message.js";
import { jsonDoc, requestAccountId, requestUser } from "./utils.js";

const verifyAndExplain = new VerifyAndExplain();

export class ExplainResource extends Resource {


    @get('/:explanationId/stream')
    async streamMessageCompletion(ctx: Context) {
        const explanationId = ctx.params.explanationId;
        const expl = await Explanation.findById(explanationId).populate('user', 'name');

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

        try {
            expl.status = MessageStatus.pending;
            await expl.save();

            const run = await verifyAndExplain.execute({
                data: {
                    student_name: (expl.user as any).name,
                    study_language: expl.study_language,
                    user_language: expl.user_language,
                    verifyOnly: expl.verifyOnly,
                    content: expl.topic,
                }
            }, (chunk: string) => {
                session.push(chunk);
            });

            expl.content = run.result;
            expl.status = MessageStatus.active;
            await expl.save();

            // send a close event with the crreated document attached
            session.push(jsonDoc(expl), "close");

        } catch (err: any) {
            logger.error("Error while streaming message", err);
            session.push({ error: err.message || 'Error while streaming message' }, "close");
        }

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
        const blocking = payload.blocking ?? false;
        const verifyOnly = payload.verifyOnly ?? false;

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

        if (!user.language) {
            ctx.throw(400, "User language not set");
        }

        let content: string | undefined = undefined;
        if (blocking) {
            const run = await verifyAndExplain.execute({
                data: {
                    student_name: user.name,
                    study_language: studyLanguage,
                    user_language: user.language,
                    verifyOnly: verifyOnly,
                    content: topic,
                }
            });
            content = run.result;
        }

        const explanation = await Explanation.create({
            status: blocking ? MessageStatus.active : MessageStatus.created,
            topic: topic,
            content: content,
            verifyOnly: verifyOnly,
            message: messageId,
            user: user._id,
            account: accountId,
            user_language: user.language ?? 'en',
            study_language: studyLanguage,
        });

        ctx.body = jsonDoc(explanation);

    }

}

