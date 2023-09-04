import { Resource, get } from "@koa-stack/router";
import { Context } from "koa";
import WordDefinition from "../openai/dictionnaryCompletions.js";
import { Definition, DictionnaryDefinition } from "../models/dictionnary.js";
import { jsonDoc } from "./utils.js";


export class DictionnaryResource extends Resource {

    @get('/:wordLanguage/:word/:userLanguage')
    async getDefinition(ctx: Context) {

        const word = ctx.params.word;
        const wordLanguage = ctx.params.wordLanguage;
        const userLanguage = ctx.params.userLanguage;

        console.log(`Getting definition for ${word} in ${wordLanguage} for ${userLanguage}`);

        const cachedWord = await DictionnaryDefinition.findOne({
            language: wordLanguage,
            definitionLanguage: userLanguage,
            $or: [
                { word: word },
                { normalized_form: word },
                { match_also: word }
            ]
        });

        if (cachedWord) {
            ctx.body = jsonDoc(cachedWord);
            ctx.status = 200;
            return;
        }

        const data = await new WordDefinition(word, wordLanguage, userLanguage).execute() as Definition;
        if (!data.exists) {
            ctx.throw(404, `Word ${word} not found in ${wordLanguage}`);
        }

        //if word exists, add it to the list of words that match this definition
        const normalizedWord =
            await DictionnaryDefinition.find({ normalized_form: data.normalized_form });
        if (normalizedWord.length > 0) {
            await DictionnaryDefinition.updateMany(
                { normalized_form: data.normalized_form },
                { $addToSet: { match_also: data.word } }
            );
        } else {
            await DictionnaryDefinition.create({
                word: data.word,
                word_kana: data.word_kana,
                exists: data.exists,
                language: data.language || wordLanguage,
                definitionLanguage: data.definitionLanguage || userLanguage,
                corrected_word: data.corrected_word,
                part_of_speech: data.part_of_speech,
                pronounciation: data.pronounciation,
                morphological_characteristics: data.morphological_characteristics,
                normalized_form: data.normalized_form,
                normalized_form_kana: data.normalized_form_kana,
                senses: data.senses,
                match_also: [data.word],
            });
        }

        //TODO better handle variants (should be a set of words)

        ctx.body = data;

    }
}