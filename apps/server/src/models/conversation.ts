import type { ObjectId as ObjectIdType } from 'mongoose';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

export interface IConversation {
    readonly id: string,
    readonly _id: ObjectIdType,
    study_language: string, // language code
    user_language: string, // language code
    waiting_for_completion: boolean,
    user?: string | ObjectIdType; //the user id
    title?: string,
    created: Date,
}

export const ConversationSchema = new mongoose.Schema<IConversation>({
    waiting_for_completion: { type: Boolean, required: true, default: false },
    study_language: { type: String, required: true },
    user_language: { type: String, required: true },
    user: { type: ObjectId, ref: 'User', required: false, index: true },
    title: { type: String, required: false },
}, {
    timestamps: { createdAt: 'created', updatedAt: 'modified' }
});

ConversationSchema.virtual('id').get(function (this: mongoose.Document) {
    return this._id.toString();
});

export type ConversationDocument = mongoose.Document<ObjectIdType, any, IConversation> & IConversation;

export const ConversationModel = mongoose.model<ConversationDocument>('Conversation', ConversationSchema);


