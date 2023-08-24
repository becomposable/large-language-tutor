/**
 * Manage Story generation
 */

import OpenAI from "openai";
import { CompletionBase } from "../openai/index.js"
import { Resource, post } from "@koa-stack/server";
import { Context } from "koa";


export class StoriesResource extends Resource {

    @post('/')
    async generateStory(ctx: Context) {

        const payload = (await ctx.payload).json;
        const studyLanguage = payload.studyLanguage ?? 'Japanese';
        const userLanguage = payload.userLanguage ?? 'English';

        const storyRequest = new StoryGenerator(studyLanguage);
        const result = await storyRequest.execute();

        ctx.body = result;
        ctx.status = 200;

    }

}



class StoryGenerator extends CompletionBase<StoryGenerator> {

    getAppInstruction(): string {
        return `The user is learning ${this.studyLanguage} and is speaking ${this.userLanguage}.
        The user want to train his reading and comprehension skills.
        Please write a short story (~200 words) to help the user practice.
        The story should have 5 to 10 questions after to test the comprehension of the user.
        `;
    }

    getUserMessages(): Promise<OpenAI.Chat.Completions.ChatCompletionMessage[] | undefined> {
        return Promise.resolve(undefined);
    }

}