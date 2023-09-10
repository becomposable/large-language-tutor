import type { ObjectId as ObjectIdType } from 'mongoose';
import mongoose from 'mongoose';
import { IAccount } from './account.js';
import { IUser } from './user.js';
import { MessageStatus } from './message.js';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;


export interface IExplanation {
    readonly id: string,
    readonly _id: ObjectIdType,
    status: MessageStatus,
    created: Date,
    topic: string,
    verifyOnly: boolean,
    content?: string,
    message?: string | ObjectIdType,
    user?: string | ObjectIdType | IUser,
    account?: string | ObjectIdType | IAccount,
    user_language: string,
    study_language: string,
}

export const ExplanationSchema = new mongoose.Schema<IExplanation>({
    status: { type: String, enum: Object.values(MessageStatus), default: MessageStatus.active },
    topic: { type: String, required: true, index: true },
    created: { type: Date, index: true },
    verifyOnly: { type: Boolean, default: false },
    message: { type: ObjectId, ref: 'Message', required: false, index: true },
    user: { type: ObjectId, ref: 'User', required: false, index: true },
    account: { type: ObjectId, ref: 'Account', required: false, index: true },
    content: String,
    user_language: String,
    study_language: String,
}, {
    timestamps: { createdAt: 'created', updatedAt: 'modified' }
});

ExplanationSchema.virtual('id').get(function (this: mongoose.Document) {
    return this._id.toString();
});

export type ExplanationDocument = mongoose.Document<ObjectIdType, any, IExplanation> & IExplanation;

export const Explanation = mongoose.model<ExplanationDocument>('Explanation', ExplanationSchema);