import { Resource, get, post } from "@koa-stack/server";
import { Context } from "koa";
import { jsonDoc, jsonDocs } from "../api/utils.js";
import { UserDocument, UserModel, findUserByEmail } from "../models/user.js";
import { FirebaseAuth, FirebasePrincipal } from "./firebase.js";
import { IAuthUser, Principal, authorize } from "./module.js";
import { AuthError } from "./error.js";
import { AccountDocument, AccountModel, AccountRoles } from "../models/account.js";

class AuthUser implements IAuthUser {
    constructor(public doc: UserDocument) {
    }

    get id() {
        return this.doc.id;
    }

    async toJsonObject() {

        const accounts = await AccountModel.find({ 'members.user': this.doc._id });

        let selectedAccount: AccountDocument | null = null;

        if (this.doc.last_selected_account) {
            selectedAccount = await AccountModel.findOne({
                _id: this.doc.last_selected_account,
                'members.user': this.doc._id
            })
        }

        if (!selectedAccount) {
            selectedAccount = await AccountModel.findOne({ owner: this.doc._id })
        }

        return {
            user: this.doc,
            accounts: jsonDocs(accounts),
            selected_account: selectedAccount ? jsonDoc(selectedAccount) : null
        }
    }
}


new FirebaseAuth({
    getUser: async (principal: FirebasePrincipal<AuthUser>) => {
        const token = principal.token;
        if (!token.email) {
            return null;
        }
        const user = await findUserByEmail(token.email);
        if (!user) {
            return null;
        }

        return new AuthUser(user);
    },

    createUser: async (principal: FirebasePrincipal<AuthUser>) => {
        const token = principal.token;
        if (!token.email) AuthError.notAuthorized();
        const user = await UserModel.create({
            externalId: token.uid,
            email: token.email,
            name: token.name || token.email,
            phone: token.phone_number,
            picture: token.picture,
            sign_in_provider: token.firebase.sign_in_provider,
        });

        await AccountModel.create({
            name: user.name,
            owner: user._id,
            members: [{
                user: user._id,
                role: AccountRoles.admin
            }]
        })

        return new AuthUser(user);
    }
}).register();


export class AuthResource extends Resource {

    @post("/link")
    async linkUser(ctx: Context) {
        const principal = await authorize(ctx) as Principal<AuthUser>;
        const user = await principal.getOrCreateUser();
        ctx.body = await user.toJsonObject();
    }

    @get("/me")
    async getMe(ctx: Context) {
        const principal = await authorize(ctx) as Principal<AuthUser>;
        const user = await principal.getOrCreateUser();
        ctx.body = await user.toJsonObject();
    }


}

