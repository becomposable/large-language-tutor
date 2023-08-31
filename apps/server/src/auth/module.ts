import { IncomingMessage } from 'http';
import { Context, Next } from 'koa';
import { AuthError } from './error.js';

/**
 * An interface for user objects. Should be implemented by the application 
 * 
 * The user object is used on the server to get basic details about the user and 
 * to be able to check permissions. Usually it is wrapping a database user model filled 
 * with basic details and optionally with roles and permissions.
 * 
 * The user object required by the client side may requrie additional information ans must be serializable as json.
 * You can get the user object to be sent to the client using `toJsonObject`
 * This method is async because it may need to fetch additional information from the database.
 * 
 * The only requoirement for the user object is to provide a toJsonObject method.
 */
export interface IAuthUser {
    toJsonObject: () => Promise<Record<string, any>>;
}

export abstract class Principal<UserT extends IAuthUser = any> {
    _user: Promise<any> | undefined;
    constructor(public module: AuthModule<any, UserT>, public id: string) {
    }
    get type() {
        return this.module.name;
    }

    get isAnonymous() {
        return false;
    }

    get email(): string | undefined {
        return undefined;
    }

    createUser(): Promise<UserT> {
        return this.module.createUser(this);
    }

    getUser(): Promise<UserT | null> {
        if (!this._user) {
            this._user = this.module.getUser(this);
        }
        return this._user;
    }

    async getOrCreateUser(): Promise<UserT> {
        const user = await this.getUser();
        if (!user) {
            this._user = this.createUser();
        }
        return this._user;
    }
}


const MODULES: AuthModule<any>[] = [];

export function registerAuthModule(module: AuthModule<any>) {
    MODULES.push(module);
}

export interface AuthModuleOptions<PrincipalT extends Principal, UserT = any> {
    getUser: (principal: PrincipalT) => Promise<UserT | null>;
    createUser?: (principal: PrincipalT) => Promise<UserT>,
}
export abstract class AuthModule<PrincipalT extends Principal = Principal, UserDocumentT = any> {

    constructor(public name: string, public opts: AuthModuleOptions<PrincipalT, UserDocumentT>) {
    }

    abstract authorize(authScheme: string, authToken: string, req: IncomingMessage): Promise<PrincipalT | undefined>;

    createUser(principal: PrincipalT): Promise<UserDocumentT> {
        if (this.opts.createUser) {
            return this.opts.createUser(principal);
        } else {
            throw AuthError.notSupported();
        }
    }

    getUser(principal: PrincipalT): Promise<UserDocumentT | null> {
        return this.opts.getUser(principal);
    }

    register() {
        registerAuthModule(this);
    }
}

export function getAuthModuleByName(name: string): AuthModule | null {
    for (const module of MODULES) {
        if (module.name === name) return module;
    }
    return null;
}


function extractAuthToken(req: IncomingMessage): { scheme: string, token: string } | null {
    let authHeader = req.headers.authorization;
    if (authHeader) {
        const i = authHeader.indexOf(' ');
        if (i === -1) throw AuthError.malformedAuthorizationHeader();
        const authScheme = authHeader.substring(0, i).toLowerCase();
        const authToken = authHeader.substring(i + 1).trim();
        return { scheme: authScheme, token: authToken };
    }
    return null;
}

export async function authorize(ctx: Context): Promise<Principal> {
    if (ctx.state.principal) {
        return ctx.state.principal;
    }
    const principal = await authorizeRequest(ctx.req);
    ctx.state.principal = principal;
    return principal;
}

export async function authorizeRequest(req: IncomingMessage): Promise<Principal> {
    try {
        let auth = extractAuthToken(req);
        if (auth) {
            for (const module of MODULES) {
                const principal = await module.authorize(auth.scheme, auth.token, req);
                if (principal) {
                    return principal;
                }
            }
        }
    } catch (err) {
        if (err instanceof AuthError) {
            throw err;
        } else {
            throw AuthError.unexpectedError();
        }
    }
    throw AuthError.notAuthorized();
}

export async function authMiddleware(ctx: Context, next: Next): Promise<unknown> {
    await authorize(ctx);
    return next();
}