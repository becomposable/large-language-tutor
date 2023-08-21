import { Resource, get, post } from "@koa-stack/server";
import { Context } from "koa";
import { env } from "../env.js";
import { requestChatCompletion } from "../openai/index.js";
import OpenAI from "openai";
import { Stream } from "openai/streaming";
import SSE from "better-sse";
import ServerError from "./ServerError.js";

//TODO p[ut in a shared project]
export interface IPromptPayload {
    prompt: string | string[];
    session?: string;
    stream?: boolean;
}

export default class ApiRoot extends Resource {
    @get('/')
    async getRoot(ctx: Context) {
        ctx.body = { version: env.version };
    }


    @post('/prompt')
    async prompt(ctx: Context) {
        const payload = (await ctx.payload).json as IPromptPayload;

        //TODO the prompt history should be kept in a database
        const prompt = payload.prompt;
        if (!prompt) ctx.throw(400, 'Expected a prompt property');

        let messages: OpenAI.Chat.ChatCompletionMessage[];
        if (typeof prompt === 'string') {
            messages = [{ role: "user", content: prompt }];
        } else {
            messages = prompt.map((p: string) => ({ role: "user", content: p }));
        }

        const result = await requestChatCompletion(messages, payload.stream);

        if (payload.stream) { // we need to stresam the response
            const session = await SSE.createSession(ctx.req, ctx.res);
            if (!session.isConnected) {
                throw new ServerError('SSE session not connected', 500);
            }
            const stream = result as Stream<OpenAI.Chat.Completions.ChatCompletionChunk>;
            for await (const data of stream) {
                session.push(data.choices[0]?.delta?.content ?? '');
            }
        } else {
            const text = (result as OpenAI.Chat.Completions.ChatCompletion).choices[0].message.content;
            ctx.body = { answer: text };
        }

    }
}
