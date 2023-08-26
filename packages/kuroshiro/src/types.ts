import { ROMANIZATION_SYSTEM } from "./util.js";

export interface IToken {
    [key: string]: any;
}

export interface IOptions {
    to?: "hiragana" | "katakana" | "romaji";
    mode?: "normal" | "spaced" | "okurigana" | "furigana";
    romajiSystem?: ROMANIZATION_SYSTEM;
    delimiter_start?: string;
    delimiter_end?: string;
}

