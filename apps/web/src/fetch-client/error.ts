
function createMessage(status: number, payload: any) {
    if (payload && payload.message) {
        return String(payload.message);
    } else {
        return 'Server Error: ' + status;
    }
}

export default class ServerError extends Error {
    status: number;
    payload: any;
    constructor(status: number, payload: any) {
        super(createMessage(status, payload));
        //super('Server Error: ' + status);
        //super(payload && payload.message ? payload.message : 'Server Error: ' + status);
        this.status = status;
        this.payload = payload;
    }
}
