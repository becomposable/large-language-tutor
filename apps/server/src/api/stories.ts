/**
 * Manage Story generation
 */
import { Resource, get, post } from "@koa-stack/server";
import SSE from "better-sse";
import { Context } from "koa";
import ServerError from "../errors/ServerError.js";
import { MessageStatus } from "../models/message.js";
import { IStory, Story } from "../models/stories.js";
import { AnswerChecker, IQA } from "../openai/AnswerChecker.js";
import { QuestionsGenerator } from "../openai/QuestionGenerator.js";
import StoryGenerator from "../openai/StoryGenerator.js";
import { jsonDoc, jsonDocs, requestAccountId, requestUser } from "./utils.js";

function parseStoryResult(result: string) {
    result = result.trim();
    const eol = result.indexOf('\n');
    if (eol < 0) {
        throw new ServerError(`Failed to get title and content from story: "${result}"'`, 500);
    }
    return { title: result.substring(0, eol).trim(), content: result.substring(eol + 1) }
}

export class StoriesResource extends Resource {

    @post('/')
    async postStory(ctx: Context) {

        const accountId = requestAccountId(ctx);
        const user = await requestUser(ctx);

        const payload = (await ctx.payload).json;
        const studyLanguage = payload.study_language ?? 'Japanese';
        const topic = payload.topic ?? undefined;
        const level = payload.level ?? undefined;
        const style = payload.style ?? undefined;
        const type = payload.type ?? undefined;
        const blocking = payload.blocking ?? false;

        let title, content;
        if (blocking) {
            const storyRequest = new StoryGenerator(studyLanguage, topic, level, style, type);
            const result = await storyRequest.execute();
            const parsed = parseStoryResult(result);
            title = parsed.title;
            content = parsed.content;
            if (!title || !content) {
                ctx.throw(500, `Failed to get title and content from story`);
            }
        }

        const story = await Story.create({
            user: user._id,
            account: accountId,
            status: blocking ? MessageStatus.active : MessageStatus.created,
            content: content,
            title: title,
            language: studyLanguage,
            topic: topic,
            level: level,
            style: style,
            type: type,
        });

        ctx.body = jsonDoc(story);
        ctx.status = 201;

    }

    @get('/')
    async getStories(ctx: Context) {
        const accountId = requestAccountId(ctx);
        const user = await requestUser(ctx);

        const stories = await Story.find({
            account: accountId,
            user: user._id,
        });
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

    @get('/:storyId/stream')
    async getStoryStream(ctx: Context) {
        const storyId = ctx.params.storyId;
        const story = await Story.findById(storyId);
        if (!story) {
            ctx.throw(404, `Story with id ${storyId} not found`);
        }

        if (story.status !== MessageStatus.created) {
            ctx.throw(404, `Message with id ${storyId} must be in created state`);
        }

        const session = await SSE.createSession(ctx.req, ctx.res);
        if (!session.isConnected) {
            throw new ServerError('SSE session not connected', 500);
        }

        story.status = MessageStatus.pending;
        await story.save();

        const storyRequest = new StoryGenerator(story.language, story.topic, story.level, story.style, story.type);
        const stream = await storyRequest.stream();
        const chunks = [];
        for await (const data of stream) {
            const chunk = data.choices[0]?.delta?.content ?? '';
            session.push(chunk);
            chunks.push(chunk);
        }

        const result = chunks.join('');
        const { title, content } = parseStoryResult(result);
        if (!title || !content) {
            ctx.throw(500, `Failed to get title and content from story`);
        }

        story.title = title;
        story.content = content;
        story.status = MessageStatus.active;
        await story.save();

        // send a close event with the crreated document attached
        session.push(jsonDoc(story), "close");

        ctx.status = 200;
    }


    @get('/:storyId/questions')
    async generateQuestions(ctx: Context) {

        const story = await Story.findById(ctx.params.storyId);
        if (!story) {
            ctx.throw(404, `Story with id ${ctx.params.storyId} not found`);
        }

        const questions = await generateQuestions(story);

        ctx.body = questions;
        ctx.status = 200;

    }

    @post('/:storyId/verify_answers')
    async verifyAnswers(ctx: Context) {

        const payload = (await ctx.payload).json;
        const story = await Story.findById(ctx.params.storyId);
        if (!story) {
            ctx.throw(404, `Story with id ${ctx.params.storyId} not found`);
        }

        const answers = payload.answers as IQA[];
        const checker = new AnswerChecker(story, answers);
        const result = await checker.execute();

        ctx.body = result;
        ctx.status = 200;

    }

}


async function generateQuestions(story: IStory): Promise<any> {
    const questionsGenerator = new QuestionsGenerator(story);
    const res = await questionsGenerator.execute();
    const questions = res.choices[0]?.message.function_call?.arguments;

    return questions;
}



