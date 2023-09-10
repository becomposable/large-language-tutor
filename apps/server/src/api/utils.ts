import { Context } from "koa";
import { Document } from "mongoose";
import { Principal } from "@koa-stack/auth";
import Env from "../env.js";
import { AuthUser } from "../auth/index.js";
import { AuthError } from "@koa-stack/auth";

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
    return ctx.state.principal as Principal<AuthUser> || null;
}

export function requestPrincipal(ctx: Context) {
    const principal = tryRequestPrincipal(ctx);
    if (!principal) {
        throw AuthError.notAuthorized();
    }
    return principal;
}

export async function requestUser(ctx: Context) {
    const user = await requestPrincipal(ctx).getUser();
    if (!user) {
        throw AuthError.noMatchingUserFound();
    }
    return user.doc;
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
