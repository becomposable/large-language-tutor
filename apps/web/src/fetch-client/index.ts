import ServerError from "./error";
import { buildQueryString, join } from "./utils";


export type FETCH_FN = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

type IPrimitives = string | number | boolean | null | undefined | string[] | number[] | boolean[];

interface IRequestParams {
    query?: Record<string, IPrimitives> | null;
    headers?: Record<string, string> | null;
}

interface IRequestParamsWithPayload extends IRequestParams {
    payload?: object | string | null
}

export function fetchPromise(fetchImpl?: FETCH_FN) {
    if (fetchImpl) {
        return Promise.resolve(fetchImpl);
    } else if (typeof globalThis.fetch === 'function') {
        return Promise.resolve(globalThis.fetch);
    } else {
        // install an error impl
        return Promise.resolve(() => {
            throw new Error('No Fetch implementation found')
        });
    }
}

export default class FetchClient {

    _fetch: Promise<FETCH_FN>;

    baseUrl: string;
    headers: Record<string, string> = {
        'accept': 'application/json'
    };

    lang(locale: string | undefined) {
        if (locale) {
            this.headers['accept-language'] = locale;
        } else {
            delete this.headers['accept-language'];
        }
        return this;
    }

    constructor(baseUrl: string, fetchImpl?: FETCH_FN) {
        this.baseUrl = baseUrl[baseUrl.length - 1] === '/' ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
        this._fetch = fetchPromise(fetchImpl);
    }

    withHeaders(headers: Record<string, string>) {
        const thisHeaders = this.headers;
        for (const key in headers) {
            const value = headers[key];
            if (value != null) {
                thisHeaders[key.toLowerCase()] = value;
            }
        }
        return this;
    }

    setHeader(key: string, value: string | undefined) {
        if (!value) {
            delete this.headers[key.toLowerCase()];
        } else {
            this.headers[key.toLowerCase()] = value;
        }
    }

    get(path: string, params?: IRequestParams) {
        return this.request('GET', path, params);
    }

    del(path: string, params?: IRequestParams) {
        return this.request('DELETE', path, params);
    }

    delete(path: string, params?: IRequestParams) {
        return this.request('DELETE', path, params);
    }

    post(path: string, params?: IRequestParamsWithPayload) {
        return this.request('POST', path, params);
    }

    put(path: string, params?: IRequestParamsWithPayload) {
        return this.request('PUT', path, params);
    }

    request(method: string, path: string, params?: IRequestParamsWithPayload) {
        let url = path[0] === '/' ? this.baseUrl + path : this.baseUrl + '/' + path;
        if (params?.query) {
            url += '?' + buildQueryString(params.query);
        }
        const headers = this.headers ? Object.assign({}, this.headers) : {};
        const paramsHeaders = params?.headers;
        if (paramsHeaders) {
            for (const key in paramsHeaders) {
                headers[key.toLowerCase()] = paramsHeaders[key];
            }
        }
        const init: RequestInit = {
            method: method,
            headers: headers
        }
        const payload = params?.payload;
        if (payload) {
            init.body = (typeof payload !== 'string') ? JSON.stringify(payload) : payload;
            if (!('content-type' in headers)) {
                headers['content-type'] = 'application/json';
            }
        }
        return this._fetch.then(fetch => fetch(url, init).catch(err => {
            console.error(`Failed to connect to ${url}`, err);
            throw new ServerError(0, err);
        }).then(res => {
            const payload = res.json().catch(err => {
                console.error(`Failed to parse response from ${url}`, err);
                throw new ServerError(0, err);
            });
            if (res.ok) {
                return payload;
            } else if (res.status === 404) {
                return null
            } else {
                return payload.then(resolvedPayload => {
                    throw new ServerError(res.status, resolvedPayload);
                })
            }
        }));

    }

}


export class FetchClientBase {
    basePath: string;

    constructor(public client: FetchClient, basePath: string) {
        this.basePath = !basePath || basePath === '/' ? '/' : join('/', basePath);
    }

    get(path: string, params?: IRequestParams) {
        return this.client.get(join(this.basePath, path), params);
    }

    post(path: string, params?: IRequestParamsWithPayload) {
        return this.client.post(join(this.basePath, path), params);
    }

    put(path: string, params?: IRequestParamsWithPayload) {
        return this.client.put(join(this.basePath, path), params);
    }

    del(path: string, params?: IRequestParams) {
        return this.client.del(join(this.basePath, path), params);
    }

    delete(path: string, params?: IRequestParams) {
        return this.del(path, params);
    }

}

