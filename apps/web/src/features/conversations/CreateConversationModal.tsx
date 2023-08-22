import { AddIcon } from "@chakra-ui/icons";
import { Button, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Portal, useDisclosure } from "@chakra-ui/react";


interface CreateConversationModalProps {
}
export default function CreateConversationModal({ }: CreateConversationModalProps) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
        <>
            <IconButton rounded='full' variant='ghost' aria-label="Create a new conversation"
                title='Create a new conversation'
                icon={<AddIcon />}
                onClick={onOpen}
            />
            <Portal>
                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Modal Title</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <p>Modal body text goes here.</p>
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme='blue' mr={3} onClick={onClose}>
                                Close
                            </Button>
                            <Button variant='ghost'>Create</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Portal>
        </>
    )
}

