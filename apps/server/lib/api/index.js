var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Resource, get } from "@koa-stack/server";
import env from "../env.js";
import ConversationsResource from "./conversations.js";
import { MessagesResource } from "./messages.js";
export default class ApiRoot extends Resource {
    async getRoot(ctx) {
        ctx.body = { version: env.version };
    }
    // @post('/prompt')
    // async prompt(ctx: Context) {
    //     console.log('POST /prompt');
    //     const payload = (await ctx.payload).json as IChatPayload;
    //     const studyLanguage = payload.userLanguage ?? 'Japanese';
    //     const userLanguage = payload.studyLanguage ?? 'English';
    //     //TODO the prompt history should be kept in a database
    //     const prompt = payload.message;
    //     if (!prompt) ctx.throw(400, 'Expected a prompt property');
    //     let messages: OpenAI.Chat.ChatCompletionMessage[];
    //     if (typeof prompt === 'string') {
    //         messages = [{ role: "user", content: prompt }];
    //     } else {
    //         messages = prompt.map((p: string) => ({ role: "user", content: p }));
    //     }
    //     const chatRequest = new ChatCompletion(studyLanguage, userLanguage, messages)
    //     const result = await chatRequest.execute();
    //     /*if (payload.stream) { // we need to stresam the response
    //         const session = await SSE.createSession(ctx.req, ctx.res);
    //         if (!session.isConnected) {
    //             throw new ServerError('SSE session not connected', 500);
    //         }
    //         const stream = result as Stream<OpenAI.Chat.Completions.ChatCompletionChunk>;
    //         for await (const data of stream) {
    //             session.push(data.choices[0]?.delta?.content ?? '');
    //         }
    //     } else {
    //         const text = (result as OpenAI.Chat.Completions.ChatCompletion).choices[0].message.content;
    //         ctx.body = { answer: text };
    //     }*/
    //     const text = result.choices[0].message.content;
    //     ctx.body = { answer: text };
    // }
    // /** Explain a sentence or word, and return the explanation */
    // @post('/explain')
    // async explain(ctx: Context) {
    //     const payload = (await ctx.payload).json as IExplainPayload;
    //     const content = payload.content;
    //     const studyLanguage = payload.userLanguage ?? 'Japanese';
    //     const userLanguage = payload.studyLanguage ?? 'English';
    //     const explainRequest = new ExplainCompletion(studyLanguage, userLanguage, content);
    //     const result = await explainRequest.execute();
    //     ctx.body = { answer: result };
    // }
    setup(router) {
        super.setup(router);
        // this will match all resources rooted in /users like /users or /users/john
        //router.use('/users', Users);
        router.mount('/conversations', ConversationsResource);
        router.mount('/messages', MessagesResource);
    }
}
__decorate([
    get('/')
], ApiRoot.prototype, "getRoot", null);
//# sourceMappingURL=index.js.map