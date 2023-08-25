//import kuromoji, { IpadicFeatures } from "kuromoji";

export interface TokenizerBuilder<T> {
    build(callback: (err: Error, tokenizer: Tokenizer<T>) => void): void;
}
export interface TokenizerBuilderOption {
    dicPath?: string | undefined;
}

interface KuromojiBuilder {
    builder: (option: TokenizerBuilderOption) => TokenizerBuilder<IpadicFeatures>;
}

export interface IpadicFeatures {
    word_id: number;
    word_type: string;
    word_position: number;
    surface_form: string;
    pos: string;
    pos_detail_1: string;
    pos_detail_2: string;
    pos_detail_3: string;
    conjugated_type: string;
    conjugated_form: string;
    basic_form: string;
    reading?: string | undefined;
    pronunciation?: string | undefined;
}

interface Tokenizer<T> {
    // token_info_dictionary: TokenInfoDictionary;
    // unknown_dictionary: UnknownDictionary;
    // viterbi_builder: ViterbiBuilder;
    // viterbi_searcher: ViterbiSearcher;
    formatter: Formatter<T>;
    tokenize(text: string): T[];
    //getLattice(text: string): ViterbiLattice;
}
export type KuromojiTokenizer = Tokenizer<IpadicFeatures>;

interface Formatter<T> {
    formatEntry(word_id: number, position: number, type: string, features: string[]): T;
    formatUnknownEntry(word_id: number, position: number, type: string, features: string[]): T;
}
export type KuromojiFormatter = Formatter<IpadicFeatures>;


let tokenizer: Promise<KuromojiTokenizer> | undefined = undefined;

function loadKuromoji(dictPath = "/kuromoji/dict/") {
    tokenizer = new Promise<KuromojiTokenizer>((resolve, reject) => {
        if (!window) throw new Error('This function must be called in browser');
        const kuromoji = (window as any).kuromoji as KuromojiBuilder;
        if (!kuromoji) throw new Error('kurojomi library not loaded');
        console.log('### loaded kuromoji', kuromoji);
        kuromoji.builder({ dicPath: dictPath }).build(function (err, tokenizer) {
            if (err) {
                reject(err);
            } else {
                resolve(tokenizer);
            }
        });
    })
    return tokenizer;
}

// TOSO this is only working in browsers
export function useKuromoji() {
    if (!tokenizer) {
        tokenizer = loadKuromoji("https://takuyaa.github.io/kuromoji.js/demo/kuromoji/dict/");
    }
    return tokenizer;
}


export interface IJapaneseWord {
    text: string;
    tokens: IpadicFeatures[];
    unknown?: boolean;
}

//接続助詞': conjuctive particule
//助動詞: auxiliary verb
//動詞: verb

/**
 * POS details
 * 名詞: noun
 * 
 * 
 * POS Details
 * 数: number
 * 接尾: suffix
 * 助数詞: counter
 * 
 */




export async function tokenizeJapaneseWords(text: string) {
    const tokenizer = await useKuromoji();
    const tokens = tokenizer.tokenize(text);
    const words: IJapaneseWord[] = [];
    let lastWord: IJapaneseWord | undefined;
    let lastToken: IpadicFeatures | undefined;

    for (const token of tokens) {
        if (token.word_type === 'UNKNOWN') {
            lastWord = { tokens: [token], text: token.surface_form, unknown: true };
            words.push(lastWord);
        } else if (!token.pos || token.pos_detail_1 === '接続助詞' || (token.pos === '助動詞' && lastToken?.pos === '動詞')) { 
        //if current token is conjuctive particule or auxiliary verb 
            if (lastWord) {
                lastWord.text += token.surface_form;
                lastWord.tokens.push(token);
            } else {
                console.warn('Warning: token.pos is empty but no previous token found');
                lastWord = { tokens: [token], text: token.surface_form };
                words.push(lastWord);
            }
        } else if (token.pos_detail_1 === "接尾") {
        //if current is a suffix
            if (lastWord) {
                lastWord.text += token.surface_form;
                lastWord.tokens.push(token);
            } else {
                console.warn('Warning: token.pos is empty but no previous token found');
                lastWord = { tokens: [token], text: token.surface_form };
                words.push(lastWord);
            }

        } else {
            lastWord = { tokens: [token], text: token.surface_form };
            lastToken = token;
            words.push(lastWord);
        }
    }
    return { words, tokens };
}

