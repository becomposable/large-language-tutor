import { Box } from "@chakra-ui/react";
import { useState } from "react";
import { useUserSession } from "../context/UserSession";
import AIDefinitionModal from "./AIDefinitionModal";


export default function SpaceTokenizedText({ text, language }: { text: string, language?: string }) {

    const [wordToDefine, setWordToDefined] = useState<string|undefined>(undefined);
    const {user} = useUserSession();
    const [showDefinition, setShowDefinition] = useState<boolean>(false);
    const doDefine = (word: string) => {
        console.log("Defining word " + word);
        setWordToDefined(word);
        setShowDefinition(true);
    }

    return (
        <>
            {text.split(' ').map((word) => {
                return (
                    <>
                        <Word word={word} language={language} doDefine={doDefine}/>
                        <span> </span>
                    </>
                )
            })}
            <AIDefinitionModal 
                showDefinition={showDefinition} 
                setShowDefinition={setShowDefinition} 
                word={wordToDefine}
                studyLanguage={language || 'en'}
                userLanguage={user?.language ?? 'en'}
            />
        </>
    );

}

function Word({ word, doDefine }: { word: string, language?: string, doDefine: (word: string) => void }) {
    //const doExplain = useContext(ExplainContext);

    return (
        <Box as="span"
            _hover={{ backgroundColor: 'lightyellow', cursor: 'pointer' }}
            onClick={() => doDefine(word)}
            className='word'>
            {word}
        </Box>
    )
}