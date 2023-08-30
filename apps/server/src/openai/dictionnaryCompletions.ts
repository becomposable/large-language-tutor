import { JSONSchema4 } from "json-schema";
import OpenAI from "openai";
import { CompletionBase } from "../openai/index.js";


const definitionSchema: JSONSchema4 = {
    type: "object",
    properties: {
        word: { type: "string" },
        exists: { type: "boolean", description: "Does the word exist?" },
        language: { type: "string", description: "The language of the word" },
        definitionLanguage: { type: "string", description: "The language of the definition" },
        corrected_word: { type: "string", description: "The corrected word if the word is misspelled" },
        part_of_speech: { type: "string", description: "The part of speech of the word" },
        morphological_characteristics: { type: "string", description: "The morphological characteristics, for example: tense, conjugaison, plural, etc." },
        normalized_form: { type: "string" },
        senses: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    language: { type: "string" },
                    translation: { type: "string" },
                    definition: { type: "string" },
                    example: { type: "string" },
                    synonyms: { type: "string" },
                    language_level: { type: "string" },
                    appropriate_use: { type: "string" },
                }
            }
        }
    }
};


export async function defineWord(word: string, word_language: string, user_language: string): Promise<OpenAI.Chat.Completions.ChatCompletion> {

    const res = await new WordDefinition(word, word_language, user_language).execute();
    
    return res;

}

export default class WordDefinition extends CompletionBase<WordDefinition> {

    content: string

    constructor(word: string, word_language: string, user_language: string) {
        super(word_language, user_language);
        this.schema = definitionSchema;
        this.content = word;
    }

    getAppInstruction(): string {
        return `You are a language expert.
        The user is speaking ${this.userLanguage} and wants to know the definition
        of word in ${this.studyLanguage}.
        Answer with the following characteristics:
        - partof speech
        - morphological characteristics (verb, singular, plural, transitive or not, etc.)
        - normalized form (for example infinitive for a verb, singular form if plural, etc.)
        - definition(s) and one example for each
        - synonyms
        - language level and appropiate use

        Answer using the language: ${this.userLanguage}.

        `;
    }

    getUserMessages(): Promise<OpenAI.Chat.ChatCompletionMessage[]> {

        const userMsg: OpenAI.Chat.ChatCompletionMessage = {
            role: "user",
            content: `
            Please explain the following:
            ${this.content}
            `,
        };

        return Promise.resolve([userMsg]);
    }

}