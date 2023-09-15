import { Button, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react"
import AIDefinition from "./DictionnaryDefinition"


interface AIDefinitionModalProps {
    showDefinition: boolean,
    setShowDefinition: (show: boolean) => void,
    word?: string,
    studyLanguage: string,
    userLanguage: string
}

export default function AIDefinitionModal({showDefinition, setShowDefinition, word, studyLanguage, userLanguage}: AIDefinitionModalProps) {

    const onClose = () => setShowDefinition(false)

    return (
        
        <Modal isOpen={showDefinition} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>AI Dictionnary</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                <HStack>
                    <AIDefinition word={word||''} studyLanguage={studyLanguage} userLanguage={userLanguage} />
                </HStack>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme='blue' mr={3} onClick={onClose}>
                        Close
                    </Button>
                    <Button variant='ghost'>Say it</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )

}