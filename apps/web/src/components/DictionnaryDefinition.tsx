import { Box, HStack, Heading, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useUserSession } from "../context/UserSession";

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



export default function AIDefinition({ word, studyLanguage, userLanguage }: { word: string, studyLanguage: string, userLanguage: string }) {
    const [wordData, setWordData] = useState<WordData | undefined>(undefined);
    const { client } = useUserSession();

    useEffect(() => {
        client.get(`/dictionnary/${studyLanguage}/${word}/${userLanguage}`)
            .then(res => {
                setWordData(res);
            })

    }, [word]);

    return (
        <VStack align={'start'}>
            <Heading fontSize={'4xl'} py={2} pb={4}>
                <Text>{wordData?.normalized_form ?? wordData?.corrected_word ?? word }</Text>
                {(wordData?.normalized_form || wordData?.corrected_word) && <Text color={"gray.400"}>{word}</Text>}
                {wordData?.word_kana && <Text color={'blue.300'} fontSize={'2xl'}>{wordData.word_kana}</Text>}
                {wordData?.corrected_word && <Box fontSize={'xs'}>corrected from {word}</Box>}
            </Heading>
            {wordData ?
                <Box textAlign={'start'}>
                    <Text textTransform={"capitalize"}>{wordData.part_of_speech} {wordData.morphological_characteristics}</Text>
                    <Text fontStyle={'italic'}>Pronounced as {wordData.pronounciation}</Text>
                    {wordData.senses.map((sense, idx) => {
                        return (
                            <Sense sense={sense} key={idx} />
                        )
                    })}
                </Box>
                :
                <Box>Asking our AI Assistant for the definition...</Box>
            }
        </VStack >
    )
}

function Sense({ sense }: { sense: Sense }) {

    return (
        <Box textAlign={'left'} py={3}>
            <Text fontSize={'1.2em'} fontWeight={'bold'}>{sense.translation}</Text>
            <Text fontSize={'md'} fontStyle={"italic"}>{sense.definition}</Text>
            <Text py={2}>Example: {sense.example}</Text>
            <Text>Synonyms: {sense.synonyms}</Text>
            <Text>Level and Appropriate Use: {sense.language_level} | {sense.appropriate_use}</Text>
            
        </Box>)

}