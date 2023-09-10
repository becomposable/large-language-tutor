import type { FilterQuery, ObjectId as ObjectIdType } from 'mongoose';
import mongoose from 'mongoose';
import { IConversation } from './conversation.js';
import { VerifyContentResult } from '@language-tutor/types';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

export enum MessageStatus {
    created = 'created', // created but completion must be started by the user (through streaming)
    pending = 'pending', // completion is pending
    //TODO: rename to completed
    active = 'active', // completion is done 
}

export enum MessageOrigin {
    user = 'user',
    assistant = 'assistant',
    system = 'system',
}

export interface IMessage {
    readonly id: string,
    readonly _id: ObjectIdType,
    conversation: string | ObjectIdType | IConversation,
    status: MessageStatus,
    created: Date,
    content: string,
    origin: MessageOrigin,
    in_reply_to?: string | ObjectIdType,
    verification?: VerifyContentResult,
}

export const MessageSchema = new mongoose.Schema<IMessage>({
    conversation: { type: ObjectId, ref: 'Conversation', required: true, index: true },
    status: { type: String, enum: Object.values(MessageStatus), default: MessageStatus.active },
    origin: { type: String, enum: Object.values(MessageOrigin), required: true },
    in_reply_to: { type: ObjectId, ref: 'Message', required: false, index: true },
    content: String,
    verification: {
        type: {
            is_correct: { type: Boolean, required: true },
            correction: { type: String, required: false },
            importance: { type: String, enum: ["low", "medium", "high"], required: true },
            explanation: { type: String, required: false },
        },
    },
}, {
    timestamps: { createdAt: 'created', updatedAt: 'modified' }
});

MessageSchema.virtual('id').get(function (this: mongoose.Document) {
    return this._id.toString();
});

export type MessageDocument = mongoose.Document<ObjectIdType, any, IMessage> & IMessage;

export const MessageModel = mongoose.model<MessageDocument>('Message', MessageSchema);



export interface FindPreviousMessageOptions {
    limit?: number;
    last?: IMessage;
    status?: MessageStatus;
}
export function findPreviousMessages(conversationId: ObjectIdType, props: FindPreviousMessageOptions = {}): Promise<IMessage[]> {

    const query: FilterQuery<IMessage> = {
        conversation: conversationId
    }
    if (props.last) {
        query.created = { $lt: props.last.created }
    }
    if (props.status) {
        query.status = props.status;
    }
    return MessageModel.aggregate().match(query).sort({ created: -1 }).limit(props.limit ?? 50);
}
