/**
 * Copyright 2021 Vintners SAS. All rights reserved.
 */

import mongoose from 'mongoose';
import type { ObjectId as ObjectIdType } from 'mongoose';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const emailRegex = /^([\w\-\.\+]+@([\w\-]+\.)+[\w-]{2,4})?$/;

export interface IUser {
    _id: ObjectIdType;
    id: string;
    externalId: string; // firebaseId
    email: string;
    name: string; // displayName in firebase
    language?: string; // language code 
    level?: number;
    phone?: string;
    picture?: string; // photo url if any
    sign_in_provider?: string;
    avatar?: string; // avatar version TODO remove?
    locale?: string;
    timeZone?: string;
    lastAccess?: Date;
    created: Date;
    modified: Date;

    last_selected_account?: string | ObjectIdType;
}

export type UserDocument = mongoose.Document<ObjectIdType, any, IUser> & IUser;

export const UserSchema = new mongoose.Schema<IUser>({
    externalId: { type: String, required: false, index: true },
    email: {
        type: String,
        index: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: (v: string) => emailRegex.test(v),
            message: (props: any) => `${props.value} is not a valid email!`
        }
    },
    name: { type: String, required: true },
    phone: String,
    picture: String,
    sign_in_provider: String,
    last_selected_account: { type: ObjectId, ref: 'Account', required: false },
    language: String,
    level: Number,
    avatar: String,
    locale: String,
    timeZone: String,
    lastAccess: Date,
}, {
    timestamps: { createdAt: 'created', updatedAt: 'modified' }
});

UserSchema.virtual('id').get(function (this: mongoose.Document) {
    return this._id.toString();
});


export const UserModel = mongoose.model<UserDocument>('User', UserSchema);

export async function createUser(externalId: string, name: string, email: string) {
    return await new UserModel({
        externalId: externalId,
        name: name || email,
        email: email,
    }).save();
}

export function findUserByEmail(email: string) {
    return UserModel.findOne({ email: email ? email.toLowerCase() : email }).exec();
}
