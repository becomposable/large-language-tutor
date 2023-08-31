/**
 * Manage Story generation
 */

import { Resource, get, post } from "@koa-stack/server";
import { Context } from "koa";
import OpenAI from "openai";
import { IStory, Story } from "../models/stories.js";
import { CompletionBase } from "../openai/index.js";
import { jsonDoc, jsonDocs } from "./utils.js";
import { JSONSchema4 } from "json-schema";


export class StoriesResource extends Resource {

    @post('/')
    async generateStory(ctx: Context) {

        const payload = (await ctx.payload).json;
        const studyLanguage = payload.study_language ?? 'Japanese';
        const topic = payload.topic ?? undefined;
        const level = payload.level ?? undefined;
        const style = payload.style ?? undefined;
        const type = payload.type ?? undefined;
        const blocking = payload.blocking ?? false;
        const storyRequest = new StoryGenerator(studyLanguage, topic, level, style, type);

        
        const result = await storyRequest.execute();
        const parsed = result.split('\n');
        const title = parsed?.shift();
        const content = parsed?.join('\n');

        if (!title || !content) {
            ctx.throw(500, `Failed to get title and content from story`);
        }

        const story = await Story.create({
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

class StoryGenerator extends CompletionBase<StoryGenerator> {

    topic?: string;
    level?: string;
    style?: string;
    type?: string;

    constructor(study_language?: string, topic?: string, level?: string, style?: string, type?: string) {
        super(study_language);
        this.topic = topic;
        this.level = level;
        this.style = style;
        this.type = type;
    }

    getAppInstruction(): string {

        const length = this.level === 'advanced' ? 700 : 250;
        const type = this.type ?? 'story';

        return `You are an excellent story writer, capable of many styles and topics.
        The user is learning ${this.studyLanguage} and is speaking ${this.userLanguage}.
        The user want to train his reading and comprehension skills or just have fun.
        The user is estimated to be at a ${this.level} level.
        Please write a ${type} (about ${length} words) to help the user practice.
        ${this.topic ? `The ${type} should be about: ${this.topic}.` : ''}
        ${this.level ? `The ${type} should be using a ${this.level} language level.` : ''}
        ${this.style ? `The ${type} should be writted in the following style: ${this.style}.` : ''}
        Directly output the content, no additional text as it will be parsed by a machine.
        The first line must be the of the content, the rest must be the story itself.
        `;
    }

    getUserMessages(): Promise<OpenAI.Chat.Completions.ChatCompletionMessage[] | undefined> {
        return Promise.resolve(undefined);
    }

}


const questionsSchema: JSONSchema4 = {
    type: "object",
    properties: {
        questions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    question: {
                        type: "string",
                    },
                },
            }
        }
    }
}

class QuestionsGenerator extends CompletionBase<QuestionsGenerator> {

    story: IStory;

    constructor(story: IStory) {
        super(story.language, undefined, questionsSchema);
        this.story = story;
    }

    getAppInstruction(): string {
        return `You are a language tutor.
        The user is learning ${this.studyLanguage} and is speaking ${this.userLanguage}.
        The user want to train his reading and comprehension skills.
        The user should read a story to help her/him practice. 
        Generate 5 questions for the user to answer to verify his understanding.
        Write questions in ${this.story.language}.
        Be careful to not give the answer to a question in the question itself or another question.

        <Story>
        ${this.story.content}
        <end>
        `;
    }

    getUserMessages(): Promise<OpenAI.Chat.Completions.ChatCompletionMessage[] | undefined> {
        return Promise.resolve(undefined);
    }

    parseResult(questions: string): string[] {
        return questions.split('\n').map(q => q.replace(/Q[0-9]{1}: /, ''));
    }

}

interface IQA {
    question: string,
    answer: string,
}

const qaCheckSchema: JSONSchema4 = {
    type: "object",
    properties: {
        answers: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    question: {
                        type: "string",
                    },
                    is_correct: {
                        description: "Is the answer correct?",
                        type: "boolean",
                    },
                    correct_answer: {
                        description: "The correct answer if the user's answer is incorrect",
                        type: "string",
                    },
                },
            }
        },
        score: {
            description: "The final score of the user",
            type: "number",
        }
    }
}

class AnswerChecker extends CompletionBase<AnswerChecker> {

    story: IStory;
    answers: IQA[];

    constructor(story: IStory, answers: IQA[], userLanguage?: string) {
        super(story.language, userLanguage, qaCheckSchema);
        this.story = story;
        this.answers = answers;
    }

    getAppInstruction(): string {
        return `
        The user is learning ${this.studyLanguage} and is speaking ${this.userLanguage}.
        The user wants to train his reading and comprehension skills.
        The user should read a short story to help her/him practice. 
        We have generated 5 questions for him to answer about the story.
        Read the story, and evaluate the answers of the user.
        Write in ${this.studyLanguage} except when you explain an error, write in ${this.userLanguage}

        <Short Story>
        ${this.story.content}
        <end>
        
        <Questions we asked and Answers Provided by the user>
        ${this.answers?.map((q, i) => `Q${i}: ${q.question}\nA: ${q.answer}`).join('\n')}
        <end>
        `;
    }

    getUserMessages(): Promise<OpenAI.Chat.Completions.ChatCompletionMessage[] | undefined> {
        return Promise.resolve(undefined);
    }


}