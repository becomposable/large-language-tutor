import OpenAI from 'openai';


export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});

export function requestChatCompletion(messages: OpenAI.Chat.ChatCompletionMessage[], stream = false) {
    return openai.chat.completions.create({
        stream: stream,
        model: "gpt-4",
        messages,
        temperature: 0.5,
        n: 1,
        max_tokens: 2048,
    });
}