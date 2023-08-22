import type { ObjectId as ObjectIdType } from 'mongoose';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

export interface IMessage {
    readonly id: string,
    readonly _id: ObjectIdType,
    conversation: string | ObjectIdType,
    created: Date,
    role: 'user' | 'assistant' | 'system',
    content: string,
    explanation?: string, // TODO explanation object id or inline?
}

export const MessageSchema = new mongoose.Schema<IMessage>({
    conversation: { type: ObjectId, ref: 'Conversation', required: true, index: true },
    role: { type: String, required: true },
    content: { type: String, required: true },
    explanation: String //TODO
}, {
    timestamps: { createdAt: 'created' }
});

MessageSchema.virtual('id').get(function (this: mongoose.Document) {
    return this._id.toString();
});

export type MessageDocument = mongoose.Document<ObjectIdType, any, IMessage> & IMessage;

export const MessageModel = mongoose.model<MessageDocument>('Message', MessageSchema);


