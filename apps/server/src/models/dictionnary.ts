/**
 * Dictionnary model
 *
 */

import mongoose from "mongoose";

export interface Definition {
  word: string;
  word_kana?: string;
  exists: boolean;
  language: string;
  definitionLanguage: string;
  corrected_word?: string;
  part_of_speech?: string;
  pronounciation?: string;
  morphological_characteristics?: string;
  normalized_form?: string;
  normalized_form_kana?: string;
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

export const DefinitionSchema = new mongoose.Schema<Definition>(
  {
    word: { type: String, required: true, index: true },
    word_kana: { type: String },
    exists: { type: Boolean, required: true, index: true },
    language: { type: String, required: true, index: true },
    pronounciation: { type: String },
    definitionLanguage: { type: String, required: true, index: true },
    part_of_speech: { type: String },
    morphological_characteristics: { type: String },
    normalized_form: { type: String },
    normalized_form_kana: { type: String },
    senses: [
      {
        language: { type: String },
        translation: { type: String },
        definition: { type: String },
        example: { type: String },
        synonyms: { type: String },
        language_level: { type: String },
        appropriate_use: { type: String },
      },
    ],
    source: { type: String },
    match_also: [{ type: String }],
  },
  {
    timestamps: { createdAt: "created", updatedAt: "modified" },
  }
);

export type DefinitionDocument = mongoose.Document & Definition;
//export type ExplanationDocument = mongoose.Document<ObjectIdType, any, IExplanation> & IExplanation;

DefinitionSchema.virtual("id").get(function (this: mongoose.Document) {
  return this._id.toString();
});

export const DictionnaryDefinition = mongoose.model<Definition>(
  "Definition",
  DefinitionSchema
);
