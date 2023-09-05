import OpenAI from "openai";
import { CompletionBase, KnownModels } from "./index.js";
import { JSONSchema4 } from "json-schema";

const StoryOptionsSchema: JSONSchema4 = {
    type: "object",
    properties: {
        types: {    
            type: "array",
            items: {
                type: "string",
            },
        },
        topics: {
            type: "array",
            items: {
                type: "string",
            },
        },
        styles: {
            type: "array",
            items: {
                type: "string",
            },
        },
        levels: {
            type: "array",
            items: {
                type: "string",
            },
        },
    },
};

export default class StoryOptionsGenerator extends CompletionBase<StoryOptionsGenerator> {

    constructor(studyLaguage: string, userLanguage: string) {
        super(studyLaguage, userLanguage, StoryOptionsSchema, KnownModels["gpt-4"]);
    }

    getAppInstruction(): string {
        let msg = `You are a language tutor, assistant and a writer.
        The user is learning ${this.studyLanguage} and is speaking ${this.userLanguage}.
        Please answer in ${this.userLanguage}.
        We want to create stories so the user can practice his reading and comprehension skills.
        To achieve this, we want to offer the user several choices he can choose from to get his story.
        The user can choose the type, the topic, the language, the style, the level and the type of story.
        For example:
        - Type: Short Story, Novel, Poem, Math Problem, Work Instructions, Dialog, Science Fun Fact, etc.
        - Topic: some topics, be specfic and as random as possible (for example "The life of a cat" or "Counting beans on the ocean", etc.)
        - Style: famous writers, famous journalists, 30 years old office worker, 20 years old student, etc. Put 5 names and 5 types. Be pretty specific so it's more fun.

        Create a set of options the user can choose from, make it as diverse and fun as possible, taking into
        account the age of the user if you have it.

        Each parameter need to have beetween 7 and 15 choices. You don't have to use the provided examples.
        `;

        return msg;

    }

    getUserMessages(): Promise<OpenAI.Chat.ChatCompletionMessage[]> {
        return Promise.resolve([]);
    }

}