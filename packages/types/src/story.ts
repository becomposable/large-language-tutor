import { Account, User } from './user';
import { CompletionStatus } from './common';
import { JSONSchema4 } from 'json-schema';


export interface Story {
    readonly id: string,
    status: CompletionStatus,
    created: Date,
    content?: string,
    title?: string,
    questions?: string[],
    language?: string,
    topic?: string,
    style?: string,
    level?: string,
    type?: string,
    user?: string | User //| ObjectIdType,
    account?: string | Account // | ObjectIdType,
}

//create typescript interface for the above schema
export interface QACheck {
    answers: QuestionAndAnswerCheck[],
    score: number,
}

export interface Question {
    id?: string,
    question: string,
}

export interface QuestionAndAnswer extends Question {
    answer: string,
}

export interface QuestionAndAnswerCheck extends QuestionAndAnswer {
    is_correct: boolean,
    correct_answer: string,
}

export interface StoryOptions {
    types: string[],
    topics: string[],
    styles: string[],
    levels: string[],
}


export const QuestionsSchema: JSONSchema4 = {
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

export const QuestionsAndAnswersCheckSchema: JSONSchema4 = {
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
                    answer: {
                        type: "string",
                        description: "The user's answer to the question",
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