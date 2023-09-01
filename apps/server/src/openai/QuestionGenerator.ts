import { JSONSchema4 } from "json-schema";
import { IStory } from "../models/stories.js";
import { CompletionBase } from "./index.js";
import OpenAI from "openai";

export const questionsSchema: JSONSchema4 = {
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

export class QuestionsGenerator extends CompletionBase<QuestionsGenerator> {

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

