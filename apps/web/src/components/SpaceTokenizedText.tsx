import { useContext } from "react";
import { ExplainContext } from "../features/explain/ExplainContextProvider";
import { Box } from "@chakra-ui/react";


export default function SpaceTokenizedText({ text, language }: { text: string, language?: string }) {

    return (
        <>
            {text.split(' ').map((word) => {
                return (
                    <>
                        <Word word={word} language={language} />
                        <span> </span>
                    </>
                )
            })}
        </>
    );

}

function Word({ word, language }: { word: string, language?: string }) {
    const doExplain = useContext(ExplainContext);

    return (
        <Box as="span"
            _hover={{ backgroundColor: 'lightyellow', cursor: 'pointer' }}
            onClick={() => doExplain({ content: word, studyLanguage: language })}
            className='word'>
            {word}
        </Box>
    )
}