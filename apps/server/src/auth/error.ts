export class AuthError extends Error {
    statusCode: number;
    expose = true; // this will expose the error to the client - see error handling in @koa-stack/server
    constructor(message: string, statusCode: number) {
        super(message);
        this.name = 'AuthError';
        this.statusCode = statusCode;
    }

    static notAuthorized() {
        return new AuthError('Unauthorized', 401);
    }

    static noMatchingUserFound() {
        return new AuthError('No matching user found', 401);
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
