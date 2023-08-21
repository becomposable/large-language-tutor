
export default class ServerError extends Error {
    statusCode: number;
    expose = true; // this will expose the error to the client - see error handling in @koa-stack/server
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}
