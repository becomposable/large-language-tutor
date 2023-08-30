import { AuthModule, AuthModuleOptions, Principal } from "./module.js";

export class DevPrincipal extends Principal {
    constructor(module: AuthModule, id: string) {
        super(module, id);
    }
}

export class DevAuth extends AuthModule {

    constructor(opts: AuthModuleOptions<DevPrincipal>) {
        super('dev', opts)
    }

    authorize(authScheme: string, authToken: string): Promise<Principal | undefined> {
        if (authScheme === 'dev') {
            return Promise.resolve(new DevPrincipal(this, authToken));
        }
        return Promise.resolve(undefined);
    }

}
