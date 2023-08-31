import { Context } from "koa";
import { Document } from "mongoose";
import { authorize } from "../auth/module.js";
import Env from "../env.js";

export function tryRequestAccountId(ctx: Context) {
    //return (ctx.header[OrgHeader] || ctx.query.org) as string;
    return (ctx.header[Env.xAccountHeader]) as string;
}

export function requestAccountId(ctx: Context) {
    const account = tryRequestAccountId(ctx);
    if (!account) ctx.throw(400, `Expected an ${Env.xAccountHeader} header`);
}

export async function requestUser(ctx: Context) {
    const principal = await authorize(ctx);
    const user = await principal.getUser();
    return user.doc;
}

export function requestLogin(ctx: Context) {
    return authorize(ctx);
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
