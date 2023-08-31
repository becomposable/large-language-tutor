import { AuthModule, IUser, Principal } from "./module.js";

export class AnonymousPrincipal<UserT extends IUser> extends Principal<UserT> {

    constructor(module: AnonymousAuth<UserT>) {
        super(module, "#anonymous");
    }

    get isAnonymous() {
        return true;
    }
}


export class AnonymousAuth<UserT extends IUser> extends AuthModule<AnonymousPrincipal<UserT>, UserT> {

    authorize(): Promise<AnonymousPrincipal<UserT> | undefined> {
        return Promise.resolve(new AnonymousPrincipal<UserT>(this));
    }

} 
