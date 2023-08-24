/**
 * Manage Story generation
 */

import OpenAI from "openai";
import { CompletionBase } from "../openai/index.js"
import { Resource, post, get } from "@koa-stack/server";
import { Context } from "koa";
import { Story } from "../models/stories.js";
import { jsonDoc, jsonDocs } from "./utils.js";


export class StoriesResource extends Resource {

    @post('/')
    async generateStory(ctx: Context) {

        const payload = (await ctx.payload).json;
        const studyLanguage = payload.studyLanguage ?? 'Japanese';
        const userLanguage = payload.userLanguage ?? 'English';

        const storyRequest = new StoryGenerator(studyLanguage);
        const result = await storyRequest.execute();

        const story = await Story.create({
            content: result.choices[0]?.message ?? '',
        });

        ctx.body = jsonDoc(story);
        ctx.status = 201;

    }

    @get('/')
    async getStories(ctx: Context) {

        const stories = await Story.find();
        if (!stories) {
            ctx.throw(404, `No stories found`);
        }

        ctx.body = jsonDocs(stories);
        ctx.status = 200;
    }


    @get('/:storyId')
    async getStory(ctx: Context) {

        const story = await Story.findById(ctx.params.storyId);
        if (!story) {
            ctx.throw(404, `Story with id ${ctx.params.storyId} not found`);
        }

        ctx.body = jsonDoc(story);
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