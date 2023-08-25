import { AddIcon } from "@chakra-ui/icons";
import { Button, FormControl, FormLabel, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Portal, Select, useDisclosure, useToast } from "@chakra-ui/react";
import { ChangeEvent, SyntheticEvent, useState } from "react";
import StyledIconButton from "../../components/StyledIconButton";
import { Languages } from "../../types";
import { useUserSession } from "../../context/UserSession";
import { useNavigate } from "react-router";


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
    const [userLanguage, setUserLanguage] = useState<Languages>(Languages.English);
    const [studyLanguage, setStudyLanguage] = useState<Languages>(Languages.Japanese);
    const [isLoading, setLoading] = useState<boolean>(false);
    const { client } = useUserSession();
    const toast = useToast({ isClosable: true, duration: 90000 });
    const navigate = useNavigate();

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
                    <SelectLanguage value={userLanguage} onChange={setUserLanguage} />
                </FormControl>
                <FormControl>
                    <FormLabel>Study Language</FormLabel>
                    <SelectLanguage value={studyLanguage} onChange={setStudyLanguage} />
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

interface SelectLanguageProps {
    value: Languages;
    onChange: (value: Languages) => void;
}
function SelectLanguage({ value, onChange }: SelectLanguageProps) {
    const _onChange = (ev: ChangeEvent<HTMLSelectElement>) => {
        onChange(ev.target.value as Languages)
    }
    return (
        <Select value={value} onChange={_onChange}>
            <option value='Japanese'>Japanese</option>
            <option value='English'>English</option>
            <option value='French'>French</option>
            <option value='Romanian'>Romanian</option>
        </Select>
    )
}