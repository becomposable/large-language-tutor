import { Box, Button, Heading, Input, InputGroup, Textarea, VStack } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { ExplainStreamView } from "./ExplainStreamView";



interface ExplainViewProps {
    explainId?: string;
}

export default function ExplainView({ explainId }: ExplainViewProps) {

    const [ contentToExplain, setContentToExplain ] = useState<string | undefined>(undefined);
    const content = useRef<HTMLTextAreaElement>(null);

    const doExplain = () => {
        console.log("Explain: ", contentToExplain);
        setContentToExplain(undefined);
        setContentToExplain(content.current?.value);
    }

    useEffect(() => {
        if (explainId) {
            console.log("Explain ID: ", explainId);
        }
    }, [explainId]);

    return (

        <VStack>
        <Heading as="h1" size="lg" mb="8">
            Explain Anything!
        </Heading>

        <InputGroup size="lg" width="100%">
        <Textarea ref={content} 
            placeholder="Enter what you would like to explain, don't hesitate to provide details about context to get a better explaination." size="lg" />        
        <Button colorScheme="blue"  size="lg" onClick={doExplain} >Explain!</Button>
        </InputGroup>

        {contentToExplain && 
        <Box width={"100%"} pt={10} px={2}>
            <Heading as="h2" size="md" mb="8">
                Explanation
            </Heading>
        <ExplainStreamView contentToExplain={contentToExplain} />
        </Box>
        }

        </VStack>

    )



}