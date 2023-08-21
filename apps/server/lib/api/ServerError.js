export default class ServerError extends Error {
    constructor(message, statusCode) {
        super(message);
        Object.defineProperty(this, "statusCode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "expose", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        }); // this will expose the error to the client - see error handling in @koa-stack/server
        this.statusCode = statusCode;
    }
}
//# sourceMappingURL=ServerError.js.map