import { Resource, Router, get } from "@koa-stack/server";
import { Context, Next } from "koa";
import Env from "../env.js";
import ConversationsResource from "./conversations.js";
import { DictionnaryResource } from "./dictionnary.js";
import { ExplainResource } from "./explain.js";
import { MessagesResource } from "./messages.js";
import { StoriesResource } from "./stories.js";
import { authorize } from "../auth/module.js";
//import { authMiddleware, authorize } from "../auth/module.js";

//TODO put in a shared project
export interface IUserPayload {
    studyLanguage: string;
    userLanguage: string;
    stream?: boolean;
    session?: string;
}
export interface IChatPayload extends IUserPayload {
    message: string | string[];
}

export interface IExplainPayload extends IUserPayload {
    content: string;
}

export default class ApiRoot extends Resource {

    @get('/')
    async getRoot(ctx: Context) {
        ctx.body = { version: Env.version };
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

    setup(router: Router) {
        super.setup(router);

        router.use(async (ctx: Context, next: Next) => {
            // resources which are not used for streaming requires a login
            if (!ctx.path.endsWith('/stream')) {
                await authorize(ctx);
            }
            return await next();
        })

        // this will match all resources rooted in /users like /users or /users/john
        //router.use('/users', Users);
        router.mount('/conversations', ConversationsResource);
        router.mount('/messages', MessagesResource);
        router.mount('/explain', ExplainResource);
        router.mount('/stories', StoriesResource);
        router.mount('/dictionnary', DictionnaryResource);
    }


}
