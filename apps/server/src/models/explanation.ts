import type { ObjectId as ObjectIdType } from 'mongoose';
import mongoose from 'mongoose';
import { IConversation } from './conversation.js';
import { IUser } from './user.js';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;


export interface IExplanation {
    readonly id: string,
    readonly _id: ObjectIdType,
    created: Date,
    topic: string,
    content?: string,
    conversation?: string | ObjectIdType | IConversation,
    message?: string | ObjectIdType,
    user?: string | ObjectIdType | IUser,
}

export const ExplanationSchema = new mongoose.Schema<IExplanation>({
    topic: { type: String, required: true, index: true },
    created: { type: Date, index: true },
    conversation: { type: ObjectId, ref: 'Conversation', required: false, index: true },
    message: { type: ObjectId, ref: 'Message', required: false, index: true },
    user: { type: ObjectId, ref: 'User', required: false, index: true },
    content: String,
}, {
    timestamps: { createdAt: 'created', updatedAt: 'modified' }
});

ExplanationSchema.virtual('id').get(function (this: mongoose.Document) {
    return this._id.toString();
});

export type ExplanationDocument = mongoose.Document<ObjectIdType, any, IExplanation> & IExplanation;

export const Explanation = mongoose.model<ExplanationDocument>('Explanation', ExplanationSchema);