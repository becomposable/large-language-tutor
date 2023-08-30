import { IncomingMessage } from 'http';
import { Context, Next } from 'koa';

export class AuthError extends Error {
    statusCode: number;
    expose = true; // this will expose the error to the client - see error handling in @koa-stack/server
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }

    static notAuthorized() {
        return new AuthError('Unauthorized', 401);
    }

    static notSupported() {
        return new AuthError('Feature not supported', 401);
    }

    static malformedAuthorizationHeader() {
        return new AuthError('Malformed authorization header', 401)
    }

    static unexpectedError() {
        return new AuthError('Unexpected error', 500);
    }
}

export abstract class Principal<UserDocumentT = any> {
    _user: Promise<any> | undefined;
    constructor(public module: AuthModule<any, UserDocumentT>, public id: string) {
    }
    get type() {
        return this.module.name;
    }

    createUser(): Promise<UserDocumentT> {
        return this.module.createUser(this);
    }

    getUser(): Promise<UserDocumentT | null> {
        if (!this._user) {
            this._user = this.module.getUser(this);
        }
        return this._user;
    }

    async getOrCreateUser(): Promise<UserDocumentT> {
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

export interface AuthModuleOptions<PrincipalT extends Principal, UserDocumentT = any> {
    getUser: (principal: PrincipalT) => Promise<UserDocumentT | null>;
    createUser?: (principal: PrincipalT) => Promise<UserDocumentT>,
    createUserOnAuth?: boolean;
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
    const principal = await authorize(ctx);
    if (principal.module.opts.createUserOnAuth) {
        await principal.getOrCreateUser();
    }
    return next();
}