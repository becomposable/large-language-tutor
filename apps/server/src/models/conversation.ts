import type { ObjectId as ObjectIdType } from 'mongoose';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

export interface IConversation {
    readonly id: string,
    readonly _id: ObjectIdType,
    language: string, // language code
    user?: string | ObjectIdType; //the user id
    created: Date,
}

export const ConversationSchema = new mongoose.Schema<IConversation>({
    language: { type: String, required: false },
    user: { type: ObjectId, ref: 'User', required: false, index: true },
}, {
    timestamps: { createdAt: 'created' }
});

ConversationSchema.virtual('id').get(function (this: mongoose.Document) {
    return this._id.toString();
});

export type ConversationDocument = mongoose.Document<ObjectIdType, any, IConversation> & IConversation;

export const ConversationModel = mongoose.model<ConversationDocument>('Conversation', ConversationSchema);


