import { JSONSchema4 } from "json-schema";
import { IStory } from "../models/stories.js";
import { CompletionBase } from "./index.js";
import OpenAI from "openai";

export interface IQA {
    question: string,
    answer: string,
}

export const qaCheckSchema: JSONSchema4 = {
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

export class AnswerChecker extends CompletionBase<AnswerChecker> {

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