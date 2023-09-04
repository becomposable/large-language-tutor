import type { ObjectId as ObjectIdType } from 'mongoose';
import mongoose from 'mongoose';
//const Schema = mongoose.Schema;

enum MessageStatus {
    active = 'active',
    pending = 'pending',
    created = 'created',
    deleted = 'deleted',
}



export interface Interaction {
    readonly id: string,
    readonly _id: ObjectIdType,
    status: MessageStatus,
    cache_policy: string,
    model: string,
    temperature: number,
    prompt: string,
    stream: boolean,
    max_tokens: number,
    parameters: {},
    substitutions: {},
    result?: {
        type: string,
        text?: string,
        object?: {},
    }
    ttl?: number, //in seconds from created
    created: Date,
}

export const ExplanationSchema = new mongoose.Schema<Interaction>({

    status: { type: String, enum: Object.values(MessageStatus), default: MessageStatus.active },
    cache_policy: { type: String, required: true, default: 'no_cache' },
    model: { type: String, required: true, default: 'davinci:2020-05-03' },
    temperature: { type: Number, required: true, default: 0.7 },
    prompt: { type: String, required: true },
    stream: { type: Boolean, required: true, default: false },
    max_tokens: { type: Number, required: false},
    parameters: { type: Object, required: true, default: {} },
    substitutions: { type: Object, required: true, default: {} },
    result: { type: Object, required: false },
    ttl: { type: Number, required: false },
    created: { type: Date, index: true },
});

ExplanationSchema.virtual('id').get(function (this: mongoose.Document) {
    return this._id.toString();
});

//export type ExplanationDocument = mongoose.Document<ObjectIdType, any, IExplanation> & IExplanation;

//export const Explanation = mongoose.model<ExplanationDocument>('Explanation', ExplanationSchema);