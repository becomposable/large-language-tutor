import type { ObjectId as ObjectIdType } from 'mongoose';
import mongoose from 'mongoose';
import { IAccount } from './account.js';
import { MessageStatus } from './message.js';
import { IUser } from './user.js';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

export interface IStory {
    readonly id: string,
    readonly _id: ObjectIdType,
    status: MessageStatus,
    created: Date,
    content?: string,
    title?: string,
    questions?: string[],
    language?: string,
    topic?: string,
    style?: string,
    level?: string,
    type?: string,
    user?: string | ObjectIdType | IUser,
    account?: string | ObjectIdType | IAccount,
}

export const StorySchema = new mongoose.Schema<IStory>({
    status: { type: String, enum: Object.values(MessageStatus), default: MessageStatus.active },
    title: { type: String, required: false, index: true },
    topic: { type: String, required: false, index: false },
    style: { type: String, required: false, index: false },
    language: { type: String, required: false, index: false },
    level: { type: String, required: false, index: false },
    type: { type: String, required: false, index: false },
    created: { type: Date, index: true },
    user: { type: ObjectId, ref: 'User', required: false, index: true },
    account: { type: ObjectId, ref: 'Account', required: false, index: true },
    content: String,
}, {
    timestamps: { createdAt: 'created', updatedAt: 'modified' }
});

StorySchema.virtual('id').get(function (this: mongoose.Document) {
    return this._id.toString();
});

export type StoryDocument = mongoose.Document<ObjectIdType, any, IStory> & IStory;

export const Story = mongoose.model<StoryDocument>('Story', StorySchema);

