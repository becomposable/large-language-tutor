import { Document } from "mongoose";

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
