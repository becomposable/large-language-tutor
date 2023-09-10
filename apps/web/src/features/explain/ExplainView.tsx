import { Box, Button, HStack, Heading, Textarea, VStack } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { IExplainContext } from "./ExplainContextProvider";
import { ExplainStreamView } from "./ExplainStreamView";



interface ExplainViewProps {
    explainId?: string;
}

export default function ExplainView({ explainId }: ExplainViewProps) {

    const [ explainContext, setExplainContext ] = useState<IExplainContext>({ content: undefined });
    const content = useRef<HTMLTextAreaElement>(null);

    const doVerify = () => {
        runExplain(true);
    }

    const doExplain = () => {
        runExplain(false);
    }

    const runExplain = (verifyonly: boolean) => {
        const explainContext: IExplainContext = {
            content: content.current?.value,
            verifyOnly: verifyonly,
        }
        setExplainContext(explainContext);
        console.log("Explain: ", explainContext);
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

        <Textarea ref={content} 
            placeholder="Enter what you would like to explain, don't hesitate to provide details about context to get a better explaination." size="lg" />        
        
        <HStack>
        <Button colorScheme="yellow"  size="lg" onClick={doVerify} >Verify</Button>
        <Button colorScheme="blue"  size="lg" onClick={doExplain} >Explain</Button>
        </HStack>

        {explainContext.content && 
        <Box width={"100%"} pt={10} px={2}>
            <Heading as="h2" size="md" mb="8">
                Explanation
            </Heading>
        <ExplainStreamView explainContext={explainContext} />
        </Box>
        }

        </VStack>

    )



}