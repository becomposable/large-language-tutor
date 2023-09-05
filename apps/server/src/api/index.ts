import { Resource, filters, get, routes } from "@koa-stack/router";
import { Context, Next } from "koa";
import Env from "../env.js";
import ConversationsResource from "./conversations.js";
import { DictionnaryResource } from "./dictionnary.js";
import { ExplainResource } from "./explain.js";
import { MessagesResource } from "./messages.js";
import { StoriesResource } from "./stories.js";
import { authorize } from "@koa-stack/auth";
import { UsersResource } from "./users.js";
//import { authMiddleware, authorize } from "../auth/module.js";

//TODO put in a shared project
export interface IUserPayload {
    studyLanguage: string;
    userLanguage: string;
    stream?: boolean;
    session?: string;
}
export interface IChatPayload extends IUserPayload {
    message: string | string[];
}

export interface IExplainPayload extends IUserPayload {
    content: string;
}

@routes({
    '/conversations': ConversationsResource,
    '/messages': MessagesResource,
    '/explain': ExplainResource,
    '/stories': StoriesResource,
    '/dictionnary': DictionnaryResource,
    '/users': UsersResource,

})
@filters(async (ctx: Context, next: Next) => {
    // resources which are not used for streaming requires a login
    if (!ctx.path.endsWith('/stream')) {
        await authorize(ctx);
    }
    return await next();
})
export default class ApiRoot extends Resource {

    @get('/')
    async getRoot(ctx: Context) {
        ctx.body = { version: Env.version };
    }

}
