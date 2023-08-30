
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import React from 'react';

async function fetchDefinition(dictLang: string, word: string, userLang: string): Promise<WordData> {
    
    const url = `http://localhost:8089/api/v1/dictionnary/${dictLang}/${word}/${userLang}`;

    console.log(`Fetching definition from ${url}`);
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    console.log(response.toString());
    const wordData = await response.json();
    return wordData;
  }

  interface Sense {
    language: string;
    translation: string;
    definition: string;
    example: string;
    synonyms: string;
    language_level: string;
    appropriate_use: string;
  }
  
  interface WordData {
    word: string;
    word_kana?: string;
    exists: boolean;
    language: string;
    definitionLanguage: string;
    pronounciation: string;
    corrected_word?: string;
    part_of_speech: string;
    morphological_characteristics: string;
    normalized_form: string;
    normalized_form_kana?: string;
    senses: Sense[];
  }
  
  interface WordDefinitionProps {
    wordData: WordData;
  }
  
export default async function Page({ params }: { params: { word: string, dictLang: string, userLang: string } }) {

    const { word, dictLang, userLang } = params;

    console.log(`Fetching definition for ${word} in ${userLang} from ${dictLang} dictionary.`);

    if (!dictLang || !word || !userLang) {
        return <div className="text-red-600 text-2xl font-bold">Invalid URL.</div>;
    }

    const wordData = await fetchDefinition(dictLang.toString(), word.toString(), userLang.toString());

    if (!wordData.exists) {
      return <div className="text-red-600 text-2xl font-bold">Word does not exist.</div>;
    }
  
    return (
      <div className="word-definition p-8 bg-inherit rounded-lg shadow-lg">
        <h1 className="text-4xl font-extrabold mb-4">{wordData.word} {wordData.word_kana && <span className="text-2xl text-gray-600">({wordData.word_kana})</span>}</h1>
        <p className="text-lg mb-2"><span className="font-semibold">Pronunciation:</span> {wordData.pronounciation}</p>
        <p className="text-lg mb-2"><span className="font-semibold">Language:</span> {wordData.language}</p>
        <p className="text-lg mb-2"><span className="font-semibold">Definition Language:</span> {wordData.definitionLanguage}</p>
        <p className="text-lg mb-2"><span className="font-semibold">Corrected Word:</span> {wordData.corrected_word}</p>
        <p className="text-lg mb-2"><span className="font-semibold">Part of Speech:</span> {wordData.part_of_speech}</p>
        <p className="text-lg mb-2"><span className="font-semibold">Morphological Characteristics:</span> {wordData.morphological_characteristics}</p>
  
        {wordData.senses.map((sense, index) => (
          <div key={index} className="bg-inherit p-4 rounded-lg shadow-md my-4">
            <h2 className="text-2xl font-bold mb-2">Definition in {sense.language}</h2>
            <p className="text-lg mb-1"><span className="font-semibold">Translation:</span> {sense.translation}</p>
            <p className="text-lg mb-1"><span className="font-semibold">Definition:</span> {sense.definition}</p>
            <p className="text-lg mb-1"><span className="font-semibold">Example:</span> {sense.example}</p>
            <p className="text-lg mb-1"><span className="font-semibold">Synonyms:</span> {sense.synonyms}</p>
            <p className="text-lg mb-1"><span className="font-semibold">Language Level:</span> {sense.language_level}</p>
            <p className="text-lg mb-1"><span className="font-semibold">Appropriate Use:</span> {sense.appropriate_use}</p>
          </div>
        ))}
      </div>
    );
  };