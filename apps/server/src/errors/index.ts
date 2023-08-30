import ServerError from "./ServerError.js";


export function notAuthorized() {
    return new ServerError('Unauthorized', 401);
}

export function malformedAuthorizationHeader() {
    return new ServerError('Malformed authorization header', 401)
}

export function unexpectedError() {
    return new ServerError('Unexpected error', 500);
}