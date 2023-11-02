import { AuthError, AuthToken, authorize } from "@koa-stack/auth";
import { FirebaseAuth, FirebaseToken } from "@koa-stack/auth-firebase";
import { Resource, get, post } from "@koa-stack/router";
import { Context } from "koa";
import { jsonDoc, jsonDocs } from "../api/utils.js";
import { AccountDocument, AccountModel, AccountRoles } from "../models/account.js";
import { UserDocument, UserModel, findUserByEmail } from "../models/user.js";
import { sendSlackMessage } from "../services/slack-notifier.js";

async function createUser(authToken: FirebaseToken<UserPrincipal>) {
    const token = authToken.token;
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

    sendSlackMessage(`New user created: ${user.name} (${user.email})`);

    return new UserPrincipal(authToken, user);
}

export class UserPrincipal {
    constructor(public auth: AuthToken, public user: UserDocument) {
    }

    get module() {
        return this.auth.module;
    }

    get type() {
        return this.auth.type;
    }

    get id(): string {
        return this.user.id;
    }

    async toJsonObject() {

        const accounts = await AccountModel.find({ 'members.user': this.user._id });

        let selectedAccount: AccountDocument | null = null;

        if (this.user.last_selected_account) {
            selectedAccount = await AccountModel.findOne({
                _id: this.user.last_selected_account,
                'members.user': this.user._id
            })
        }

        if (!selectedAccount) {
            selectedAccount = await AccountModel.findOne({ owner: this.user._id })
        }

        return {
            user: jsonDoc(this.user),
            accounts: jsonDocs(accounts),
            selected_account: selectedAccount ? jsonDoc(selectedAccount) : null
        }
    }
}


new FirebaseAuth({
    getPrincipal: async (authToken: FirebaseToken<UserPrincipal>) => {
        const token = authToken.token;
        if (!token.email) {
            return null;
        }
        const user = await findUserByEmail(token.email);
        if (!user) {
            return null;
        }

        return new UserPrincipal(authToken, user);
    },

}).register();


export class AuthResource extends Resource {

    @post("/link")
    async linkUser(ctx: Context) {
        const token = await authorize(ctx) as AuthToken<UserPrincipal>;
        let principal = await token.getPrincipal();
        if (!principal) {
            if (token.type === 'firebase') {
                principal = await createUser(token as FirebaseToken<UserPrincipal>);
            } else {
                ctx.throw(401, "User cannot be created");
            }
        }
        return await principal.toJsonObject();
    }

    @get("/me")
    async getMe(ctx: Context) {
        const token = await authorize(ctx) as AuthToken<UserPrincipal>;
        const principal = await token.getPrincipal();
        if (!principal) {
            ctx.throw(404, "User not found");
        }
        ctx.body = await principal.toJsonObject();
    }

}

