import { Context } from "koa";
import { Document } from "mongoose";
import Env from "../env.js";

export function tryRequestAccount(ctx: Context) {
    return ctx.header[Env.xAccountHeader] as string;
}

export function requestAccount(ctx: Context) {
    const account = tryRequestAccount(ctx);
    if (!account) ctx.throw(400, `Expected an ${Env.xAccountHeader} header`);
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
