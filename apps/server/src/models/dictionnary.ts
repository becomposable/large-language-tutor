/**
 * Dictionnary model
 * 
 */

import mongoose from "mongoose";


export interface Definition {
    word: string;
    exists: boolean;
    language: string;
    definitionLanguage: string;
    corrected_word?: string;
    part_of_speech?: string;
    morphological_characteristics?: string;
    normalized_form?: string;
    senses?: Sense[];
    source?: string;
    match_also: string[];
    created: Date;
    modified: Date;
}

interface Sense {
    language?: string;
    translation?: string;
    definition?: string;
    example?: string;
    synonyms?: string;
    language_level?: string;
    appropriate_use?: string;
}

export const DefinitionSchema = new mongoose.Schema<Definition>({
    word: { type: String, required: true, index: true },
    exists: { type: Boolean, required: true, index: true },
    language: { type: String, required: true, index: true },
    definitionLanguage: { type: String, required: true, index: true },
    part_of_speech: { type: String },
    morphological_characteristics: { type: String },
    normalized_form: { type: String },
    senses: [{
        language: { type: String },
        translation: { type: String },
        definition: { type: String },
        example: { type: String },
        synonyms: { type: String },
        language_level: { type: String },
        appropriate_use: { type: String },
    }],
    source: { type: String },
    match_also: [{ type: String }]
}, {
    timestamps: { createdAt: 'created', updatedAt: 'modified' }
})

export type DefinitionDocument = mongoose.Document & Definition;
//export type ExplanationDocument = mongoose.Document<ObjectIdType, any, IExplanation> & IExplanation;

DefinitionSchema.virtual('id').get(function (this: mongoose.Document) {
    return this._id.toString();
});

export const DictionnaryDefinition = mongoose.model<DefinitionDocument>('Definition', DefinitionSchema);

