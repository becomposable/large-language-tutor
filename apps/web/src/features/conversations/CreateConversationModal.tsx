import { AddIcon } from "@chakra-ui/icons";
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Portal, useDisclosure } from "@chakra-ui/react";
import { SyntheticEvent } from "react";
import StyledIconButton from "../../components/StyledIconButton";


interface CreateConversationModalProps {
}
export default function CreateConversationModal({ }: CreateConversationModalProps) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const onOpenModal = (e: SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onOpen();
    }
    return (
        <>
            <StyledIconButton
                title='Create a new conversation'
                icon={<AddIcon />}
                onClick={onOpenModal}
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

