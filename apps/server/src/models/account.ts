
import mongoose from 'mongoose';
import type { ObjectId as ObjectIdType } from 'mongoose';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

export enum AccountRoles {
    user = 'user',
    admin = 'admin',
}

export interface IAccount {
    _id: ObjectIdType;
    id: string;
    name: string;
    owner: string | ObjectIdType;
    members: { user: string | ObjectIdType, role: string, disabled: boolean }[],
    //settings: any; //TODO
    created: Date;
    modified: Date;
}

export type AccountDocument = mongoose.Document<ObjectIdType, any, IAccount> & IAccount;

export const AccountSchema = new mongoose.Schema<IAccount>({
    owner: { type: String, required: false, index: true },
    name: { type: String, required: true },
    members: [{
        user: { type: ObjectId, ref: 'User', required: true, index: true },
        role: { type: String, enum: Object.values(AccountRoles), required: true, default: AccountRoles.user },
        disabled: { type: Boolean, default: false },
    }]
}, {
    timestamps: { createdAt: 'created', updatedAt: 'modified' }
});

AccountSchema.virtual('id').get(function (this: mongoose.Document) {
    return this._id.toString();
});


export const AccountModel = mongoose.model<AccountDocument>('Account', AccountSchema);


