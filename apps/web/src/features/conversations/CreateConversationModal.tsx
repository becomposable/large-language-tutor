import { AddIcon } from "@chakra-ui/icons";
import { Button, FormControl, FormLabel, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Portal, useDisclosure, useToast } from "@chakra-ui/react";
import { SyntheticEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import LanguageSelector from "../../components/LanguageSelector";
import StyledIconButton from "../../components/StyledIconButton";
import { useUserSession } from "../../context/UserSession";


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
                title='Create a conversation'
                icon={<AddIcon />}
                onClick={onOpenModal}
            />
            <Portal>
                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Create a conversation</ModalHeader>
                        <ModalCloseButton />
                        <CreateForm onClose={onClose} />
                    </ModalContent>
                </Modal>
            </Portal>
        </>
    )
}


interface CreateFormProps {
    onClose: () => void;
}
function CreateForm({ onClose }: CreateFormProps) {
    const [userLanguage, setUserLanguage] = useState<string>('en');
    const [studyLanguage, setStudyLanguage] = useState<string>('en');
    const [isLoading, setLoading] = useState<boolean>(false);
    const { client, user } = useUserSession();
    const toast = useToast({ isClosable: true, duration: 90000 });
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.language) {
            setUserLanguage(user.language);
        }
    }, [user])

    const onSubmit = () => {
        setLoading(true);
        client.post('/conversations', {
            payload: {
                user_language: userLanguage,
                study_language: studyLanguage
            }
        }).then(r => {
            onClose();
            navigate(`/conversations/${r.id}`)
        }).catch(err => {
            toast({
                status: 'error',
                title: 'Failed to create conversation',
                description: err.message
            })
        }).finally(() => {
            setLoading(false);
        });
    }

    return (
        <>
            <ModalBody>
                <FormControl mb='4'>
                    <FormLabel>User Language</FormLabel>
                    <LanguageSelector value={userLanguage} onChange={setUserLanguage} />
                </FormControl>
                <FormControl>
                    <FormLabel>Study Language</FormLabel>
                    <LanguageSelector value={studyLanguage} onChange={setStudyLanguage} />
                </FormControl>
            </ModalBody>
            <ModalFooter>
                <Button variant='ghost' mr={3} onClick={onClose}>
                    Close
                </Button>
                <Button isLoading={isLoading} colorScheme='blue' onClick={onSubmit} >Create</Button>
            </ModalFooter>
        </>
    )
}