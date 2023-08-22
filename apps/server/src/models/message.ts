import type { ObjectId as ObjectIdType } from 'mongoose';
import mongoose from 'mongoose';
import { IConversation } from './conversation.js';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

export enum MessageOrigin {
    user = 'user',
    assistant = 'assistant',
    system = 'system',
}

export interface IMessage {
    readonly id: string,
    readonly _id: ObjectIdType,
    conversation: string | ObjectIdType | IConversation,
    created: Date,
    content: string,
    origin: MessageOrigin,
    in_reply_to?: string | ObjectIdType,
}

export const MessageSchema = new mongoose.Schema<IMessage>({
    conversation: { type: ObjectId, ref: 'Conversation', required: true, index: true },
    origin: { type: String, enum: Object.values(MessageOrigin), required: true },
    in_reply_to: { type: ObjectId, ref: 'Message', required: false, index: true },
    content: String,
}, {
    timestamps: { createdAt: 'created' }
});

MessageSchema.virtual('id').get(function (this: mongoose.Document) {
    return this._id.toString();
});

export type MessageDocument = mongoose.Document<ObjectIdType, any, IMessage> & IMessage;

export const MessageModel = mongoose.model<MessageDocument>('Message', MessageSchema);



export function findPreviousMessages(conversationId: ObjectIdType, limit?: number, last?: IMessage): Promise<IMessage[]> {

    const agg = MessageModel.aggregate().match({
        conversation: conversationId,
    })

    if (last) {
        agg.match({
            created: { $lt: last.created },
        })
    }

    return agg.sort({ created: -1 }).limit(limit ?? 50);

}
