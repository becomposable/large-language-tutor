import { Resource, get, post } from "@koa-stack/server";
import SSE from "better-sse";
import { Context } from "koa";
import ServerError from "../errors/ServerError.js";
import { ConversationModel, IConversation } from "../models/conversation.js";
import { MessageModel, MessageOrigin } from "../models/message.js";
import { ChatCompletion } from "../openai/index.js";
import { jsonDoc } from "./utils.js";


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
        const stream = await chatRequest.stream(50);
        const chunks = [];
        for await (const data of stream) {
            const chunk = data.choices[0]?.delta?.content ?? '';
            session.push(chunk);
            chunks.push(chunk);
        }

        await MessageModel.create({
            conversation: msg.conversation._id,
            content: chunks.join(''),
            origin: MessageOrigin.assistant,
            in_reply_to: msg._id,
        });

        ctx.status = 200;

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
            content: payload.content,
            origin: MessageOrigin.user,
        });


        if (payload.stream) {
            // ctx.body = jsonDoc(message);
            // ctx.status = 201;
            return; // we are done, the client will stream the completion
        }

        //not streaming - ask right now for a completion
        const chatRequest = new ChatCompletion(conversation);
        const result = await chatRequest.execute();
        const content = result.choices[0].message.content || '';

        const newMsg = await MessageModel.create({
            conversation: conversation._id,
            content: content,
            origin: MessageOrigin.assistant,
            in_reply_to: message._id,
        });

        ctx.body = jsonDoc(newMsg);
        ctx.status = 201;

    }

}
