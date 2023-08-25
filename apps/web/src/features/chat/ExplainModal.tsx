import { Box, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { MdLightbulbOutline } from "react-icons/md";
import StyledIconButton from "../../components/StyledIconButton";
import DefaultBlinkingCursor from "../../components/ellipsis-anim/DefaultBlinkingCursor";
import { useUserSession } from "../../context/UserSession";
import { IExplanation } from "../../types";



interface ExplainModalProps {
    messageId: string;
}
export default function ExplainModal({ messageId }: ExplainModalProps) {
    const { onOpen, onClose, isOpen } = useDisclosure();
    return (
        <>
            <StyledIconButton title='Explain' icon={<MdLightbulbOutline />} onClick={onOpen} />

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent minW='50vw'>
                    <ModalHeader>Explanation</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box h='60vh' overflowY='auto'>
                            <ExplainMessageStreamView messageId={messageId} />
                        </Box>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}


interface ExplainMessageStreamViewProps {
    messageId: string;
}
function ExplainMessageStreamView({ messageId }: ExplainMessageStreamViewProps) {
    const { client } = useUserSession();
    const [content, setContent] = useState('');
    const [explanation, setExplanation] = useState<IExplanation | null>(null);

    useEffect(() => {
        const chunks: string[] = [];
        const sse = new EventSource(client.getUrl(`/messages/${messageId}/explain/stream`));
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
        return () => {
            sse.close();
        }
    }, [])

    return (
        <Box w='100%' h='100%'>
            <Box whiteSpace='pre-line'>
                {explanation?.content || content}
                {!explanation && <DefaultBlinkingCursor />}
            </Box>
        </Box>
    )
}