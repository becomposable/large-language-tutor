var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Resource, get, post } from "@koa-stack/server";
import { env } from "../env.js";
import { requestChatCompletion } from "../openai/index.js";
import SSE from "better-sse";
import ServerError from "./ServerError.js";
export default class ApiRoot extends Resource {
    async getRoot(ctx) {
        ctx.body = { version: env.version };
    }
    async prompt(ctx) {
        const payload = (await ctx.payload).json;
        //TODO the prompt history should be kept in a database
        const prompt = payload.prompt;
        if (!prompt)
            ctx.throw(400, 'Expected a prompt property');
        let messages;
        if (typeof prompt === 'string') {
            messages = [{ role: "user", content: prompt }];
        }
        else {
            messages = prompt.map((p) => ({ role: "user", content: p }));
        }
        const result = await requestChatCompletion(messages, payload.stream);
        if (payload.stream) { // we need to stresam the response
            const session = await SSE.createSession(ctx.req, ctx.res);
            if (!session.isConnected) {
                throw new ServerError('SSE session not connected', 500);
            }
            const stream = result;
            for await (const data of stream) {
                session.push(data.choices[0]?.delta?.content ?? '');
            }
        }
        else {
            const text = result.choices[0].message.content;
            ctx.body = { answer: text };
        }
    }
}
__decorate([
    get('/')
], ApiRoot.prototype, "getRoot", null);
__decorate([
    post('/prompt')
], ApiRoot.prototype, "prompt", null);
//# sourceMappingURL=index.js.map