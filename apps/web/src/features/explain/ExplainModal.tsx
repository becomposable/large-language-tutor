import { Box, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import { IExplainContext } from "./ExplainContextProvider";
import { ExplainStreamView } from "./ExplainStreamView";

export default function ExplainModal({context, onClose}: {context: IExplainContext, onClose: () => void}) {

    return (
        <Modal isOpen={true} onClose={onClose}>
            <ModalOverlay />
            <ModalContent minW='50vw'>
                <ModalHeader>Explanation</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box h='60vh' overflowY='auto'>
                        <ExplainStreamView explainContext={context} />
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
