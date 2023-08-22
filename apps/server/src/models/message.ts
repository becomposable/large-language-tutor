import type { ObjectId as ObjectIdType } from 'mongoose';
import mongoose from 'mongoose';
import { IConversation } from './conversation.js';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

export interface IMessage {
    readonly id: string,
    readonly _id: ObjectIdType,
    conversation: string | ObjectIdType | IConversation,
    created: Date,
    question: string,
    answer: string,
    answered: Date | string,
    explanation?: string, // TODO explanation object id or inline?
}

export const MessageSchema = new mongoose.Schema<IMessage>({
    conversation: { type: ObjectId, ref: 'Conversation', required: true, index: true },
    question: { type: String, required: true },
    answer: String,
    answered: Date,
    explanation: String //TODO
}, {
    timestamps: { createdAt: 'created' }
});

MessageSchema.virtual('id').get(function (this: mongoose.Document) {
    return this._id.toString();
});

export type MessageDocument = mongoose.Document<ObjectIdType, any, IMessage> & IMessage;

export const MessageModel = mongoose.model<MessageDocument>('Message', MessageSchema);


export function findPreviousMessages(last: IMessage, limit: number): Promise<IMessage[]> {
    const convId = typeof last.conversation === 'string' ? new mongoose.Types.ObjectId(last.conversation) : last.conversation;
    return MessageModel.aggregate().match({
        conversation: convId,
        created: { $lt: last.created }
    }).sort({ created: -1 }).limit(limit);
}
