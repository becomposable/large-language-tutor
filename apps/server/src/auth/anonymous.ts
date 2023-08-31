import { AuthModule, IAuthUser, Principal } from "./module.js";

export class AnonymousPrincipal<UserT extends IAuthUser> extends Principal<UserT> {

    constructor(module: AnonymousAuth<UserT>) {
        super(module, "#anonymous");
    }

    get isAnonymous() {
        return true;
    }
}


export class AnonymousAuth<UserT extends IAuthUser> extends AuthModule<AnonymousPrincipal<UserT>, UserT> {

    authorize(): Promise<AnonymousPrincipal<UserT> | undefined> {
        return Promise.resolve(new AnonymousPrincipal<UserT>(this));
    }

} 
