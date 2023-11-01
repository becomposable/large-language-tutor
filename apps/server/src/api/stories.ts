/**
 * Manage Story generation
 */
import { Resource, ServerError, get, post, put } from "@koa-stack/router";
import {
    AnswerChecker,
    AnswerCheckerProps,
    GenerateAStory, GenerateQuestions, GenerateStoryOptions
} from "@language-tutor/interactions";
import {
    Question,
    QuestionAndAnswer
} from "@language-tutor/types";
import { Context } from "koa";
import logger from "../logger.js";
import { MessageStatus } from "../models/message.js";
import { Story } from "../models/stories.js";
import { UserModel } from "../models/user.js";
import { jsonDoc, jsonDocs, requestAccountId, requestUser } from "./utils.js";

function parseStoryResult (result: string) {
    result = result.trim();
    const eol = result.indexOf("\n");
    if (eol < 0) {
        throw new ServerError(
            `Failed to get title and content from story: "${result}"'`,
            500
        );
    }
    return {
        title: result.substring(0, eol).trim(),
        content: result.substring(eol + 1),
    };
}

export class StoriesResource extends Resource {
    @post("/")
    async postStory (ctx: Context) {
        const accountId = requestAccountId(ctx);
        const user = await requestUser(ctx);

        const payload = (await ctx.payload).json;
        const studyLanguage = payload.study_language ?? "Japanese";
        const topic = payload.topic ?? undefined;
        const level = payload.level ?? undefined;
        const style = payload.style ?? undefined;
        const type = payload.type ?? undefined;
        const blocking = payload.blocking ?? false;

        let title, content;
        if (blocking) {
            const storyRequest = new GenerateAStory();
            const req = await storyRequest.execute({
                data: {
                    student_name: user.name,
                    user_language: user.language ?? "english",
                    study_language: studyLanguage,
                    topic: topic,
                    level: level,
                    style: style,
                    type: type,
                    length: 500,
                }
            });
            const parsed = parseStoryResult(req.result);
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

    @get("/")
    async getStories (ctx: Context) {
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

    @get("/options")
    async getStoryOptions (ctx: Context) {
        const userId = await requestUser(ctx);
        const user = await UserModel.findById(userId);
        if (!user) {
            ctx.throw(403, `User with id ${userId} not found`);
        }
        const studyLanguage = ctx.query.studyLanguage as string;
        const userLanguage = user.language ?? "en";

        const optionGenerator = new GenerateStoryOptions();
        const res = await optionGenerator.execute({
            data: {
                student_name: user.name,
                user_language: userLanguage,
                study_language: studyLanguage,
            }
        });

        ctx.body = {
            type: "StoryOptions",
            data: res.result,
            generated_at: new Date(),
        };
    }

    @get("/:storyId")
    async getStory (ctx: Context) {
        const story = await Story.findById(ctx.params.storyId);
        if (!story) {
            ctx.throw(404, `Story with id ${ctx.params.storyId} not found`);
        }

        ctx.body = jsonDoc(story);
        ctx.status = 200;
    }


    @put("/:storyId")
    async updateStory (ctx: Context) {
        const story = await Story.findById(ctx.params.storyId);
        if (!story) {
            ctx.throw(404, `Story with id ${ctx.params.storyId} not found`);
        }
        const payload = (await ctx.payload).json;

        story.set(payload);
        await story.save();
        ctx.status = 200;
    }


    @get("/:storyId/questions")
    async generateQuestions (ctx: Context) {
        const user = await requestUser(ctx);
        const story = await Story.findById(ctx.params.storyId);
        if (!story) {
            ctx.throw(404, `Story with id ${ctx.params.storyId} not found`);
        }
        if (!story.content) {
            ctx.throw(400, `Story has no content`);
        }

        const questionsGenerator = new GenerateQuestions();
        const res = await questionsGenerator.execute({
            data: {
                content: story.content,
                student_name: user.name,
                user_language: user.language ?? "english",
                study_language: story.language ?? "english",
            }
        });

        ctx.body = {
            data: res.result.questions as Question[],
            type: "Questions",
            generated_at: new Date(),
        };
        ctx.status = 200;
    }

    /**
     * Verify the answers to the questions
     * @param ctx
     */
    @post("/:storyId/verify_answers")
    async verifyAnswers (ctx: Context) {
        const payload = (await ctx.payload).json;
        const user = await requestUser(ctx);
        const story = await Story.findById(ctx.params.storyId);
        if (!story) {
            ctx.throw(404, `Story with id ${ctx.params.storyId} not found`);
        }



        const answers = payload.data as QuestionAndAnswer[];

        if (!answers || answers.length === 0) {
            ctx.throw(400, `No answers provided`);
        }
        if (!story.content) {
            ctx.throw(400, `Story has no content`);
        }

        if (!user.language || !story.language) {
            ctx.throw(400, `User or story has no language`);
        }

        const data: AnswerCheckerProps = {
            student_name: user.name,
            student_age: 22, //TODO: replace with user.age,
            interests: [],
            study_language: story.language,
            user_language: user.language,
            story: story.content,
            answers: answers,
        };

        const checker = new AnswerChecker();
        const result = await checker.execute({
            data: data,
        });
        logger.info(`Answer checker result: ${JSON.stringify(result)}`);

        ctx.body = {
            data: result.result,
            type: "QACheck",
            generated_at: new Date(),
        };
        ctx.status = 200;
    }
}
