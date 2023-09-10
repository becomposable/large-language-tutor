import OpenAI from "openai";
import { CompletionBase } from "./index.js";

const languageNames = new Intl.DisplayNames(['en'], {
    type: 'language'
  });

export default class StoryGenerator extends CompletionBase<StoryGenerator> {

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
        const studyLanguageName = this.studyLanguage?.length === 2 ? languageNames.of(this.studyLanguage.toLowerCase()) : this.studyLanguage;
        const userLanguageName = this.userLanguage.length === 2 ? languageNames.of(this.userLanguage.toLowerCase()) : this.userLanguage;

        return `
        You are a language tutor and an excellent story writer, capable of many styles and topics.
        
        The user is learning ${studyLanguageName} and is speaking ${userLanguageName}.
        The user want to train his reading and comprehension skills or just have fun.

        Please write a ${type} (about ${length} words) to help the user practice.
        ${this.topic ? `The ${type} should be about: ${this.topic}.` : ''}
        ${this.level ? `The ${type} should be using a ${this.level} language level.` : ''}
        ${this.style ? `The ${type} should be writted in the following style: ${this.style}.` : ''}
        Directly output the content, no additional text as it will be parsed by a machine.
        
        The first line must be the of the content, the rest must be the story itself.
        You must write in ${studyLanguageName}.
        `;
    }

    getUserMessages(): Promise<OpenAI.Chat.Completions.ChatCompletionMessage[] | undefined> {
        return Promise.resolve(undefined);
    }

}

