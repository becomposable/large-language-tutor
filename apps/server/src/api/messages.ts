import { ChatPromptSchema } from "@composableai/sdk";
import { Resource, Router, ServerError, get, post } from "@koa-stack/router";
import { StudyLanguageChat, VerifyMessage } from "@language-tutor/interactions";
import SSE from "better-sse";
import { Context } from "koa";
import logger from "../logger.js";
import { ConversationDocument, ConversationModel, IConversation } from "../models/conversation.js";
import { Explanation } from "../models/explanation.js";
import { MessageDocument, MessageModel, MessageOrigin, MessageStatus, findPreviousMessages } from "../models/message.js";
import { UserDocument } from "../models/user.js";
import ExplainCompletion from "../openai/ExplainCompletion.js";
import { ConversationCompletion } from "../openai/index.js";
import { jsonDoc, jsonDocs, requestAccountId, requestUser } from "./utils.js";

const studyLanguageChat = new StudyLanguageChat();

export class MessagesResource extends Resource {

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

    setup(router: Router): void {
        super.setup(router);
        router.mount('/:messageId', MessageResource);
    }
}

async function getChatMessages(conversation: ConversationDocument, limit = 50, lastMessage?: MessageDocument): Promise<ChatPromptSchema[]> {
    const latestMessages = await findPreviousMessages(conversation._id, {
        limit: limit, status: MessageStatus.active, last: lastMessage
    });
    const messages: ChatPromptSchema[] = [];

    for (let i = latestMessages.length - 1; i >= 0; i--) {
        const m = latestMessages[i];
        if (m.origin !== MessageOrigin.system) {
            messages.push({ role: m.origin as string, content: m.content } as ChatPromptSchema);
        }
    }

    return messages;
}


class MessageResource extends Resource {

    @get('/stream')
    async streamMessageCompletion(ctx: Context) {
        const msgId = ctx.params.messageId;
        const msg = await MessageModel.findById(msgId).populate({
            path: 'conversation',
            populate: {
                path: 'user',
            }
        });

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

        const conversation = msg.conversation as ConversationDocument;
        const user = conversation.user as unknown as UserDocument;

        try {
            const run = await studyLanguageChat.execute({
                data: {
                    student_name: user.name,
                    study_language: conversation.study_language,
                    user_language: conversation.user_language,
                    student_age: 10,
                    chat: await getChatMessages(conversation, 50, msg),
                }
            }, (chunk: string) => {
                session.push(chunk);
            });

            msg.content = run.result;
            msg.status = MessageStatus.active;
            await msg.save();

            session.push(jsonDoc(msg), "close");
        } catch (err: any) {
            logger.error("Error while streaming message", err);
            session.push({ error: err.message || 'Error while streaming message' }, "close");
        }

        ctx.status = 200;
    }

    /**
     * This will return the explanation if an explanation already exists otherwise 
     * it will create a new empty one and return it. The user will be able to complete 
     * the explanation by calling the explanation stream endpoint
     * @param ctx 
     */
    @post('/explain')
    async explainMessage(ctx: Context) {
        const accountId = requestAccountId(ctx);
        const user = await requestUser(ctx);

        const msgId = ctx.params.messageId;
        const msg = await MessageModel.findById(msgId).populate<{
            conversation: IConversation,
        }>('conversation');

        if (!msg) {
            ctx.throw(404, `Message with id ${msgId} not found`);
        }

        if (msg.status !== MessageStatus.active) {
            ctx.throw(404, `Message with id ${msgId} must be in active state`);
        }

        let expl = await Explanation.findOne({ message: msgId });

        if (!expl) {
            // create the explanation object
            expl = await Explanation.create({
                account: accountId,
                user: user._id,
                status: MessageStatus.created,
                topic: msg.content,
                message: msg.id,
                content: undefined,
                study_language: msg.conversation.study_language,
                user_language: user.language ?? 'en',
            });
        }

        ctx.body = jsonDoc(expl);
        ctx.status = 200;
    }


    /**
     * This verifies the message, store the result and return the result
     * @param ctx
     *  */

    @get('/verify')
    async verifyMessage(ctx: Context) {
        const user = await requestUser(ctx);
        const msgId = ctx.params.messageId;
        const msg = await MessageModel.findById(msgId).populate('conversation');
        if (!msg) ctx.throw(404, `Message with id ${msgId} not found`);
        if (!user.language) ctx.throw(400, "User language not set");

        //if already present, return
        if (msg.verification) {
            ctx.body = msg.verification;
            ctx.status = 200;
            return;
        }

        const verifyRequest = new VerifyMessage();
        const run = await verifyRequest.execute({
            data: {
                content: msg.content,
                user_language: user.language,
                study_language: (msg.conversation as IConversation).study_language,
                student_name: user.name,
            }
        });
        msg.verification = run.result;
        logger.info(`Message ${msgId} verified`, run.result);
        await msg.save();

        ctx.body = msg.verification;
        ctx.status = 200;
    }

    /**
     * @deprecated this endpoint is depreacted and should be removed
     * @param ctx 
     */
    @get('/explain/stream')
    async streamExplainMessage(ctx: Context) {
        const msgId = ctx.params.messageId;
        let expl = await Explanation.findOne({ message: msgId });

        const session = await SSE.createSession(ctx.req, ctx.res);
        if (!session.isConnected) {
            throw new ServerError('SSE session not connected', 500);
        }

        if (expl && expl.content) {
            // stream the existing content
            session.push(expl.content);
        } else { // we need to complete the explanation

            const message = await MessageModel.findById(msgId).populate<{
                conversation: IConversation,
            }>('conversation');
            if (!message) {
                ctx.throw(404, 'Message not found');
            }
            if (!message.content) {
                ctx.throw(400, 'Message has no content');
            }
            const explRequest = new ExplainCompletion(message.conversation.study_language,
                message.conversation.user_language, message.content, false, msgId);
            const stream = await explRequest.stream();
            const chunks = [];
            for await (const data of stream) {
                const chunk = data.choices[0]?.delta?.content ?? '';
                session.push(chunk);
                chunks.push(chunk);
            }
            const content = chunks.join('');

            if (!expl) {
                // create the explanation object
                expl = await Explanation.create({
                    //TODO user and account
                    topic: message.content,
                    conversation: message.conversation,
                    message: message.id,
                    user: message.conversation.user,
                    content: content
                });
            } else {
                expl.content = content;
                await expl.save();
            }
        }

        session.push(jsonDoc(expl), 'close');

        ctx.body = 200;
    }

}
