import { Resource, get, post } from "@koa-stack/server";
import { Context } from "koa";
import { jsonDoc } from "../api/utils.js";
import { UserDocument, UserModel, findUserByEmail } from "../models/user.js";
import { FirebaseAuth, FirebasePrincipal } from "./firebase.js";
import { IUser, Principal, authorize } from "./module.js";
import { AuthError } from "./error.js";


class User implements IUser {
    constructor(public doc: UserDocument) {
    }

    async toJsonObject() {
        return Promise.resolve(jsonDoc(this.doc));
    }
}


new FirebaseAuth({
    getUser: (principal: FirebasePrincipal<User>) => {
        const token = principal.token;
        return token.email ? findUserByEmail(token.email) : Promise.resolve(null);
    },
    createUser: (principal: FirebasePrincipal<User>) => {
        const token = principal.token;
        if (!token.email) AuthError.notAuthorized();
        return UserModel.create({
            externalId: token.uid,
            email: token.email,
            name: token.name || token.email,
            phone: token.phone_number,
            picture: token.picture,
            sign_in_provider: token.firebase.sign_in_provider,
        })
    }
}).register();


export class AuthResource extends Resource {

    @post("/link")
    async linkUser(ctx: Context) {
        const principal = await authorize(ctx) as Principal<User>;
        const user = await principal.getOrCreateUser();
        ctx.body = await user.toJsonObject();
    }

    @get("/me")
    async getMe(ctx: Context) {
        const principal = await authorize(ctx) as Principal<User>;
        const user = await principal.getOrCreateUser();
        ctx.body = await user.toJsonObject();
    }


}

