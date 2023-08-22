import { Resource, Router, get, post } from "@koa-stack/server";
import { Context } from "koa";
import { ConversationModel } from "../models/conversation.js";
import { jsonDoc, jsonDocs } from "./utils.js";

class ConversationResource extends Resource {
    @get('/')
    async getConversation(ctx: Context) {
        const id = ctx.params.conversationId;
        const result = await ConversationModel.findById(id);
        if (!result) {
            ctx.throw(404, `Conversation with id ${id} not found`)
        }
        ctx.body = jsonDoc(result);
    }



    @get('/messages')
    async getMessages(ctx: Context) {
        //TODO last not yet implemented
        //const last = ctx.query.last; // last message id - to be used to appky the tail
        // if tail is specifid we only return the last ${tail} messages
        const tail = ctx.query.tail ? parseInt(ctx.query.tail as string) : 20; // last 20 messages

        if (isNaN(tail) || tail < 0) {
            ctx.throw(400, 'Invalid tail parameter. Expecting a positive integer');
        }

        //TODO for now we list all conversations since we don't have authentication yet
        const messages = await ConversationModel.find({}).sort({ created: -1 }).limit(tail);
        ctx.body = jsonDocs(messages);
    }

}

export default class ConversationsResource extends Resource {
    
    /**
     * List conversations for the authenticated user
     */
    @get('/')
    async listConversations(ctx: Context) {
        //TODO for now we list all conversations since we don't have authentication yet
        const conversations = await ConversationModel.find({});
        jsonDocs(conversations);
        ctx.body = jsonDocs(conversations);
    }

    /**
     * Create a new conversation
     */
    @post('/')
    async createConversation(ctx: Context) {
        const payload = (await ctx.payload).json;

        const study_language = payload.study_language ?? 'Japanese';
        const user_language = payload.user_language ?? 'English';

        const conversation = await ConversationModel.create({
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