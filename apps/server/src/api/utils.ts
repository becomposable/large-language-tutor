import { AuthError } from "@koa-stack/auth";
import { Context } from "koa";
import { Document } from "mongoose";
import { UserPrincipal } from "../auth/index.js";
import Env from "../env.js";

export function tryRequestAccountId(ctx: Context) {
    //return (ctx.header[OrgHeader] || ctx.query.org) as string;
    return (ctx.header[Env.xAccountHeader]) as string;
}

export function requestAccountId(ctx: Context) {
    const account = tryRequestAccountId(ctx);
    if (!account) ctx.throw(400, `Expected an ${Env.xAccountHeader} header`);
    return account;
}

export function tryRequestPrincipal(ctx: Context) {
    return ctx.auth ? ctx.auth.getPrincipal() : Promise.resolve(null);
}

export async function requestPrincipal(ctx: Context): Promise<UserPrincipal> {
    if (ctx.auth) {
        const principal = await ctx.auth.getPrincipal();
        if (!principal) {
            throw new AuthError("No matching user was found", 401);
        }
        return principal;
    }
    throw AuthError.notAuthorized();
}

export async function requestUser(ctx: Context) {
    const principal = await requestPrincipal(ctx);
    return principal.user;
}

export function jsonDoc(doc: Document, virtuals?: boolean) {
    return doc.toJSON({
        virtuals: !!virtuals,
        versionKey: false, transform: (doc, ret) => {
            delete ret._id;
            if (!ret.id) {
                ret.id = doc._id.toString();
            }
        }
    });
}

export function jsonDocs(docs: Document[], virtuals?: boolean) {
    return docs.map(doc => doc.toJSON({
        virtuals: !!virtuals,
        versionKey: false, transform: (doc, ret) => {
            delete ret._id;
            ret.id = doc._id.toString();
        }
    }));
}
