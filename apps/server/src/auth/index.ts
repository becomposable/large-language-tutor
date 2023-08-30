import { Resource, get, post } from "@koa-stack/server";
import { Context } from "koa";
import { jsonDoc } from "../api/utils.js";
import { UserDocument, UserModel, findUserByEmail } from "../models/user.js";
import { FirebaseAuth, FirebasePrincipal } from "./firebase.js";
import { AuthError, Principal, authorize } from "./module.js";


new FirebaseAuth({
    getUser: (principal: FirebasePrincipal<UserDocument>) => {
        const token = principal.token;
        return token.email ? findUserByEmail(token.email) : Promise.resolve(null);
    },
    createUser: (principal: FirebasePrincipal<UserDocument>) => {
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
        const principal = await authorize(ctx) as Principal<UserDocument>;
        const user = await principal.getOrCreateUser();
        ctx.body = jsonDoc(user);
    }

    @get("/me")
    async getMe(ctx: Context) {
        const principal = await authorize(ctx) as Principal<UserDocument>;
        const user = await principal.getOrCreateUser();
        ctx.body = jsonDoc(user);
    }


}
