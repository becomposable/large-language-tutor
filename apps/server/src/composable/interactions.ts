//#export 652d77c65674c387e10594bd @2023-10-30T18:33:46.337Z
// This is a generated file. Do not edit.

import { StudioClient, InteractionBase } from "@composableai/studio";

const projectId = '652d77c65674c387e10594bd';

let _client: StudioClient | undefined;
export function configure(opts: {
    serverUrl?: string,
    apikey?: string,
    projectId?: string,
    onRequest?: (url: string, init: RequestInit) => void,
    onResponse?: (response: Response) => void
}) {
    return (_client = new StudioClient({ projectId, ...opts }));
}
const getClient = () => _client;
export { getClient, projectId }

/**
 * AnswerChecker input type
 */
export interface AnswerCheckerProps {
    student_name: string;
    student_age: number;
    interests: string[];
    study_language: string;
    user_language: string;
    story: string;
    answers: {
        question: string;
        answer: string;
        [k: string]: unknown;
    }[];
}

/**
 * AnswerChecker result type
 */
export interface AnswerCheckerResult {
    answers?: {
        question?: string;
        /**
         * The user's answer to the question
         */
        answer?: string;
        /**
         * Is the answer correct?
         */
        is_correct?: boolean;
        /**
         * The correct answer if the user's answer is incorrect
         */
        correct_answer?: string;
        [k: string]: unknown;
    }[];
    /**
     * The final score of the user
     */
    score?: number;
}

/**
 * Simple Story Gen input type
 */
export interface SimpleStoryGenProps {
    style: number;
    user_age: number;
    interests: string[];
}

/**
 * Simple Story Gen result type
 */
export interface SimpleStoryGenResult {
    story: string;
    mainCharacter: string;
    theme: string;
    atmosphere: string;
}

/**
 * Universal Dictionary input type
 */
export interface UniversalDictionaryProps {
    word: string;
    study_language: string;
    user_language: string;
    content: string;
}

/**
 * Universal Dictionary result type
 */
export interface UniversalDictionaryResult {
    word?: string;
    /**
     * The word in kana if word is in Japanese language
     */
    word_kana?: string;
    /**
     * Does the word exist?
     */
    exists?: boolean;
    /**
     * The language of the word
     */
    language?: string;
    /**
     * The language of the definition
     */
    definitionLanguage?: string;
    /**
     * required: the pronounciation of the word in a way the user can read in its language and the phonetic transcription in parenthesis like ta-te-mo-no (phonetic transcription)
     */
    pronounciation?: string;
    /**
     * The corrected word if the word is misspelled
     */
    corrected_word?: string;
    /**
     * The part of speech of the word
     */
    part_of_speech?: string;
    /**
     * The morphological characteristics, for example: tense, conjugaison, plural, etc.
     */
    morphological_characteristics?: string;
    /**
     * The normalized form of the word, for example infinitive for verb, canonical for for plurals, etc.
     */
    normalized_form?: string;
    /**
     * The normalized form in kana if word is in Japanese language
     */
    normalized_form_kana?: string;
    senses?: {
        language?: string;
        translation?: string;
        definition?: string;
        example?: string;
        synonyms?: string;
        language_level?: string;
        appropriate_use?: string;
        [k: string]: unknown;
    }[];
}

/**
 * Generate a Story input type
 */
export interface GenerateAStoryProps {
    student_name: string;
    student_age: number;
    interests: string[];
    study_language: string;
    user_language: string;
    type: string;
    topic?: string;
    level?: string;
    length: number;
    style?: string;
}

/**
 * Verify and Explain input type
 */
export interface VerifyAndExplainProps {
    student_name: string;
    student_age: number;
    interests: string[];
    study_language: string;
    user_language: string;
    content: string;
}

/**
 * Verify and Explain result type
 */
export interface VerifyAndExplainResult {
    /**
     * Is the content correct and natural?
     */
    is_correct: boolean;
    /**
     * If the content is not correct, correct it here
     */
    correction?: string;
    /**
     * How important is the mistake? High means the sentence is not understandable, medium means the sentence is understandable but not natural, low means the sentence is natural but not perfect
     */
    importance: "low" | "medium" | "high";
    /**
     * Explain the mistake, in a short sentence, to the point
     */
    explanation?: string;
}

/**
 * AnswerChecker
 */
export class AnswerChecker extends InteractionBase<AnswerCheckerProps, AnswerCheckerResult> {
    project = projectId;
    constructor(client?: StudioClient) {
        super ("653ff24550279bbc4d26d892", client || _client);
    }
}

/**
 * Simple Story Gen
 */
export class SimpleStoryGen extends InteractionBase<SimpleStoryGenProps, SimpleStoryGenResult> {
    project = projectId;
    constructor(client?: StudioClient) {
        super ("652ff6fbd0344fac4c2c15c7", client || _client);
    }
}

/**
 * Universal Dictionary
 */
export class UniversalDictionary extends InteractionBase<UniversalDictionaryProps, UniversalDictionaryResult> {
    project = projectId;
    constructor(client?: StudioClient) {
        super ("65314ef978cf8f17f35dfeba", client || _client);
    }
}

/**
 * Generate a Story
 */
export class GenerateAStory extends InteractionBase<GenerateAStoryProps, any> {
    project = projectId;
    constructor(client?: StudioClient) {
        super ("652e0dfcda623bded923e678", client || _client);
    }
}

/**
 * Verify and Explain
 */
export class VerifyAndExplain extends InteractionBase<VerifyAndExplainProps, VerifyAndExplainResult> {
    project = projectId;
    constructor(client?: StudioClient) {
        super ("652e0cfeda623bded923e5f6", client || _client);
    }
}
