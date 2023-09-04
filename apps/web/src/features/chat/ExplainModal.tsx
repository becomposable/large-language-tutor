import { Box, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import DefaultBlinkingCursor from "../../components/ellipsis-anim/DefaultBlinkingCursor";
import { useUserSession } from "../../context/UserSession";
import { IExplanation } from "../../types";
import { IExplainContext } from "./ExplainContextProvider";



export default function ExplainModal({context, onClose}: {context: IExplainContext, onClose: () => void}) {

    return (
        <Modal isOpen={true} onClose={onClose}>
            <ModalOverlay />
            <ModalContent minW='50vw'>
                <ModalHeader>Explanation</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box h='60vh' overflowY='auto'>
                        <ExplainMessageStreamView messageId={context.messageId} contentContext={context.contentContext} contentToExplain={context.contentToExplain} />
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme='blue' mr={3} onClick={onClose}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}



function ExplainMessageStreamView({ messageId, contentContext, contentToExplain }: IExplainContext) {
    const { client } = useUserSession();
    const [content, setContent] = useState('');
    const [explanation, setExplanation] = useState<IExplanation | null>(null);

    useEffect(() => {
        const chunks: string[] = [];
        const payload = { content: contentToExplain, context: contentContext, messageId: messageId };
        console.log("Requesting explanaition for: " + payload);

        client.post('/explain', { payload: payload })
            .then(res => {
                setExplanation(res.data);
                console.log("Received explanation: " + res);
                const sse = new EventSource(client.getUrl(`/explain/${res.id}/stream`));
                sse.addEventListener("message", ev => {
                    const data = JSON.parse(ev.data);
                    if (data) {
                        chunks.push(data);
                        setContent(chunks.join(''))
                    }
                });
                sse.addEventListener("close", (ev) => {
                    sse.close();
                    const expl = JSON.parse(ev.data)
                    setExplanation(expl);
                });
            })
            .catch(err => {
                console.error(err);
            })
    }, []);

    return (
        <Box w='100%' h='100%'>
            <Box whiteSpace='pre-line'>
                {explanation?.content || content}
                {!explanation && <DefaultBlinkingCursor />}
            </Box>
        </Box>
    )
}