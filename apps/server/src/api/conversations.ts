import { Resource, Router, get, post } from "@koa-stack/server";
import { Context } from "koa";
import { ConversationModel } from "../models/conversation.js";
import { jsonDoc, jsonDocs, requestAccountId, requestUser } from "./utils.js";
import { MessageModel } from "../models/message.js";
import { ObjectId } from "mongodb";
import { authorize } from "../auth/module.js";


class ConversationResource extends Resource {
    @get('/')
    async getConversation(ctx: Context) {
        await authorize(ctx);

        const id = ctx.params.conversationId;
        const result = await ConversationModel.findById(id);
        if (!result) {
            ctx.throw(404, `Conversation with id ${id} not found`)
        }
        ctx.body = jsonDoc(result);
    }



    @get('/messages')
    async getMessages(ctx: Context) {
        await authorize(ctx);

        //TODO last not yet implemented
        //const last = ctx.query.last; // last message id - to be used to appky the tail
        // if tail is specifid we only return the last ${tail} messages
        // if from is specified, should be the last message id to start from
        const tail = ctx.query.tail ? parseInt(ctx.query.tail as string) : 50;
        const from = ctx.query.from ? parseInt(ctx.query.from as string) : 0;
        const cid = new ObjectId(ctx.params.conversationId);

        if (isNaN(tail) || tail < 0) {
            ctx.throw(400, 'Invalid tail parameter. Expecting a positive integer');
        }

        //TODO for now we list all conversations since we don't have authentication yet
        const messages = await MessageModel.find({ conversation: cid }).sort({ created: -1 }).skip(from).limit(tail);
        ctx.body = jsonDocs(messages.reverse());
    }

}

export default class ConversationsResource extends Resource {

    /**
     * List conversations for the authenticated user
     */
    @get('/')
    async listConversations(ctx: Context) {
        const accountId = requestAccountId(ctx);
        const user = await requestUser(ctx);
        //TODO for now we list all conversations since we don't have authentication yet
        const conversations = await ConversationModel.find({ user: user._id, account: accountId });
        jsonDocs(conversations);
        ctx.body = jsonDocs(conversations);
    }

    /**
     * Create a new conversation
     */
    @post('/')
    async createConversation(ctx: Context) {
        const accountId = requestAccountId(ctx);
        const user = await requestUser(ctx);

        const payload = (await ctx.payload).json;

        const study_language = payload.study_language ?? 'Japanese';
        const user_language = payload.user_language ?? 'English';

        const conversation = await ConversationModel.create({
            account: accountId,
            user: user._id,
            study_language: study_language,
            user_language: user_language,
        });

        ctx.body = jsonDoc(conversation);
        ctx.status = 201;
    }

    setup(router: Router): void {
        super.setup(router);
        router.mount('/:conversationId', ConversationResource);
    }

}