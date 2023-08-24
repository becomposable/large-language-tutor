import { Resource, get, post } from "@koa-stack/server";
import SSE from "better-sse";
import { Context } from "koa";
import ServerError from "../errors/ServerError.js";
import { ConversationModel, IConversation } from "../models/conversation.js";
import { MessageModel, MessageOrigin, MessageStatus } from "../models/message.js";
import { ConversationCompletion } from "../openai/index.js";
import { jsonDoc, jsonDocs } from "./utils.js";


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

        if (msg.status !== MessageStatus.created) {
            ctx.throw(404, `Message with id ${msgId} must be in created state`);
        }

        const session = await SSE.createSession(ctx.req, ctx.res);
        if (!session.isConnected) {
            throw new ServerError('SSE session not connected', 500);
        }

        msg.status = MessageStatus.pending;
        await msg.save();

        const chatRequest = new ConversationCompletion(msg.conversation, 50).beforeMessage(msg);
        // TODO we mau need to pass a lasyt message
        const stream = await chatRequest.stream();
        const chunks = [];
        for await (const data of stream) {
            const chunk = data.choices[0]?.delta?.content ?? '';
            session.push(chunk);
            chunks.push(chunk);
        }

        msg.content = chunks.join('');
        msg.status = MessageStatus.active;
        await msg.save();

        // send a close event with the crreated document attached
        session.push(jsonDoc(msg), "close");

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

        // we create  now the assitant message in pending state
        const assistantMessage = await MessageModel.create({
            conversation: conversation._id,
            content: '',
            status: payload.stream ? MessageStatus.created : MessageStatus.pending,
            origin: MessageOrigin.assistant,
            in_reply_to: message._id,
        });

        if (!payload.stream) {
            //not streaming - ask right now for a completion
            const chatRequest = new ConversationCompletion(conversation);
            const result = await chatRequest.execute();
            const content = result.choices[0].message.content || '';

            assistantMessage.content = content;
            assistantMessage.status = MessageStatus.active;
            await assistantMessage.save();
        }

        ctx.body = jsonDocs([message, assistantMessage]);
        ctx.status = 201;
    }

}
