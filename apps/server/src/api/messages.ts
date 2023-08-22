import { Resource, get, post } from "@koa-stack/server";
import { MessageModel } from "../models/message.js";
import { ConversationModel, IConversation } from "../models/conversation.js";
import ServerError from "../errors/ServerError.js";
import { ChatCompletion } from "../openai/index.js";
import { Context } from "koa";
import { jsonDoc } from "./utils.js";
import SSE from "better-sse";


export class MessagesResource extends Resource {

    @get('/sse/:messageId')
    async streamMessageCompletion(ctx: Context) {
        const msgId = ctx.params.messageId;
        const msg = await MessageModel.findById(msgId).populate<{
            conversation: IConversation,
        }>('conversation');

        if (!msg) {
            ctx.throw(404, `Message with id ${msgId} not found`);
        }

        const session = await SSE.createSession(ctx.req, ctx.res);
        if (!session.isConnected) {
            throw new ServerError('SSE session not connected', 500);
        }

        const chatRequest = new ChatCompletion(msg.conversation);
        const stream = await chatRequest.stream(msg, 20);
        const chunks = [];
        for await (const data of stream) {
            const chunk = data.choices[0]?.delta?.content ?? '';
            session.push(chunk);
            chunks.push(chunk);
        }
        msg.answer = chunks.join('');
        msg.answered = new Date();
        msg.save();
    }


    @post('/')
    async postMessage(ctx: Context) {
        const payload = (await ctx.payload).json;

        const conversation = await ConversationModel.findById(payload.conversation);
        if (!conversation) {
            throw new ServerError(`Conversation with id ${payload.conversation} not found`, 404);
        }

        const message = await MessageModel.create({
            conversation: conversation._id,
            question: payload.content,
        });

        if (!payload.stream) {
            // ask right now for a response            
            const chatRequest = new ChatCompletion(conversation);
            const result = await chatRequest.execute(message, 20);
            message.answer = result.choices[0].message.content || '';
            message.answered = new Date(result.created);
            await message.save();
        }

        ctx.body = jsonDoc(message);
    }

}
