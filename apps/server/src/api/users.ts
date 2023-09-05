/** 
 * Endpoint to manage users
 */

import { Resource, post } from "@koa-stack/router";
import { jsonDoc, requestUser } from "./utils.js";
import { Context } from "koa";


export class UsersResource extends Resource {

    @post('/me')
    async postUser(ctx: Context) {
        const user = await requestUser(ctx);
        const payload = (await ctx.payload).json;

        user.set(payload);
        await user.save();

        ctx.body = jsonDoc(user);
        ctx.status = 201;
    }

}
