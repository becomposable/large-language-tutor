import OpenAI from 'openai';


export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});

export function requestChatCompletion(messages: OpenAI.Chat.ChatCompletionMessage[], stream = false) {
    return openai.chat.completions.create({
        stream: stream,
        model: "gpt-4",
        messages: messages,
        temperature: 0.5,
        n: 1,
        max_tokens: 2048,

    });
}

export function requestCompletion(prompt: string, stream = false) {

    return openai.completions.create({
        stream: stream,
        model: 'text-davinci-003',
        prompt: prompt,
        temperature: 0.5,
        n: 1,
        max_tokens: 2048,
        stop: ['\n']
    });

}

/** Abstract class defining the base methods of a prompt
 * Implement and extend this class to create Prompt that can be used to
 * Generate Prompts for use case and LLMs.
 * Type properly the constructor to force passing the right arguments
 */
abstract class Prompt<T extends Prompt<T>> {
    
    studyLanguage: string;
    userLanguage: string;
    userInterests?: string[];
    userAge?: number;
    userLevel?: string;

    constructor(studyLanguage: string, userLanguage: string) {
        this.studyLanguage = studyLanguage;
        this.userLanguage = userLanguage;
    }

}

export class ChatCompletion extends Prompt<ChatCompletion> {

    messages: OpenAI.Chat.ChatCompletionMessage[]

    constructor(studyLanguage: string, userLanguage: string, messages: OpenAI.Chat.ChatCompletionMessage[]) {
        super(studyLanguage, userLanguage);
        this.messages = messages;
        this.userLevel = "JPLT4";               

    }

    getMessages(): OpenAI.Chat.ChatCompletionMessage[] {
        let msg = `
        You are a language tutor. The user is learning ${this.studyLanguage} and is speaking ${this.userLanguage}.
        You are chatting with this user to help him/her practice and learn ${this.studyLanguage}.
        Always make sure your messages are engaging and helpful.
        `;

        if (this.userLevel) {
            msg = msg + `The user is at level ${this.userLevel} in ${this.studyLanguage}. Please only use words and structure that should be accessible for this level in the language.`;
        }

        if (this.userAge) {
            msg = msg + `The user is ${this.userAge} years old. Please use a language appropriate for that age and make sure topics are relevant.`;
        }

        if (this.userInterests) {
            msg = msg + `The user is interested in ${this.userInterests.join(",")}. Please use a language appropriate for that age and make sure topics are relevant.`;
        }

        const sysMessage: OpenAI.Chat.ChatCompletionMessage = {
            role: "system",
            content: msg,
        }

        return [sysMessage, ...this.messages];

    }

    async execute(): Promise<OpenAI.Chat.Completions.ChatCompletion> {
        const messages = this.getMessages();
        console.log(messages, "Executing a new chat Request");

        const result = await requestChatCompletion(messages, false) as OpenAI.Chat.Completions.ChatCompletion;
        return result
    }

}

export class ExplainCompletion extends Prompt<ExplainCompletion> {

    content: string

    constructor(studyLanguage: string, userLanguage: string, content: string) {
        super(studyLanguage, userLanguage);
        this.content = content;
    }

    getPrompt(): string {
        const msg = `
        You are a language tutor. The user is learning ${this.studyLanguage} and is speaking ${this.userLanguage}.
        Please answer in ${this.userLanguage}. 
        Reply with a translation, an explanation of the structure of the sentence if it's a sentence or a definition of the word if it's a word.
        Please use simple words and short sentences.
        Reply using the format below:
        ---
        Content: content to be explained
        Translation: translation of the content in ${this.userLanguage}
        Explanation: 
        ---

        Taking account the previous, please explain the following between the %%% symbols:
        %%%${this.content}%%%
        `;
        return msg;
    }

    async execute(): Promise<string> {
        const prompt = this.getPrompt();
        const result = await requestCompletion(prompt, false) as OpenAI.Completions.Completion;
        return result.choices[0].text;
    }
}