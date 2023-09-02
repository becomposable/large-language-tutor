
export default class ServerError extends Error {
    statusCode: number;
    expose = true; // this will expose the error to the client - see error handling in @koa-stack/server
    constructor(msgOrCode1: string | number, msgOrCode2?: number | string) {
        super();
        this.name = 'ServerError';
        let message: string;
        if (!msgOrCode1 && !msgOrCode2) {
            message = 'Server error';
            this.statusCode = 500;
        } else if (msgOrCode2 == null) {
            if (typeof msgOrCode1 === 'number') {
                this.statusCode = msgOrCode1 as number;
                message = String('Server error');
            } else {
                message = String(msgOrCode1);
                this.statusCode = 500;
            }
        } else {
            const type1 = typeof msgOrCode1;
            const type2 = typeof msgOrCode2;

            if (type1 === 'number') {
                this.statusCode = msgOrCode1 as number;
                message = String(msgOrCode2);
            } else if (type2 === 'number') {
                this.statusCode = msgOrCode2 as number;
                message = String(msgOrCode1);
            } else {
                message = String(msgOrCode1);
                this.statusCode = 500;
            }
        }
        this.message = this.statusCode + ' - ' + message;
    }
}
