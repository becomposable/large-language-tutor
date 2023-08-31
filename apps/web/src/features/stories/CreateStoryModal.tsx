/* eslint-disable @typescript-eslint/no-unused-vars */
import { AddIcon } from "@chakra-ui/icons";
import { Button, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Portal, Select, useDisclosure, useToast } from "@chakra-ui/react";
import { ChangeEvent, SyntheticEvent, useState } from "react";
import StyledIconButton from "../../components/StyledIconButton";
import { Languages } from "../../types";
import { useUserSession } from "../../context/UserSession";
import { useNavigate } from "react-router";


interface CreateStoryModalProps {
    userLanguage?: Languages;
    studyLanguage?: string;
}

export default function CreateStoryModal({ userLanguage, studyLanguage }: CreateStoryModalProps) {
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
    const [style, setStyle] = useState<string|undefined>(undefined);
    const [level, setLevel] = useState<string|undefined>(undefined);
    const [topic, setTopic] = useState<string|undefined>(undefined);
    const [type, setType] = useState<string|undefined>(undefined);

    const [isLoading, setLoading] = useState<boolean>(false);
    const { client } = useUserSession();
    const toast = useToast({ isClosable: true, duration: 90000 });
    const navigate = useNavigate();

    const onChangeTopic = (ev: ChangeEvent<HTMLInputElement>) => {
        setTopic(ev.target.value);
    }

    const onSubmit = () => {
        setLoading(true);
        client.post('/stories', {
            payload: {
                user_language: userLanguage,
                study_language: studyLanguage,
                style: style,
                level: level,
                topic: topic,
                type: type

            }
        }).then(r => {
            onClose();
            navigate(`/stories/${r.id}`)
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
                <FormControl>
                    <FormLabel>Type</FormLabel>
                    <SelectType value={type} onChange={setType} />
                </FormControl>
                <FormControl>
                    <FormLabel>About the topic</FormLabel>
                    <Input value={topic} onChange={onChangeTopic} />
                </FormControl>
                <FormControl>
                    <FormLabel>In the style of</FormLabel>
                    <SelectStyle value={style} onChange={setStyle} />
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

interface SelectTypeProps {
    value: string;
    onChange: (value: string) => void;
}
function SelectType({ value, onChange }: SelectTypeProps) {
    const _onChange = (ev: ChangeEvent<HTMLSelectElement>) => {
        onChange(ev.target.value)
    }
    return (
        <Select value={value} onChange={_onChange}>
            <option value='story'>Story</option>
            <option value='dialog'>Dialog</option>
            <option value='work instructions'>Work Instructions</option>
            <option value='math problem'>Math Problem</option>
            <option value='novel'>Novel</option>
        </Select>
    )
}

interface SelectLevelProps {
    value?: string;
    onChange: (value: string) => void;
}
function SelectLevel({ value, onChange }: SelectLevelProps ) {
    const _onChange = (ev: ChangeEvent<HTMLSelectElement>) => {
        onChange(ev.target.value)
    }
    return (
        <Select value={value} onChange={_onChange}>
            <option value='advanced'>Advanced</option>
            <option value='medium'>Medium</option>
            <option value='beginner'>Beginner</option>
        </Select>
    )
}

interface SelectStyleProps {
    value?: string;
    onChange: (value: string) => void;
}
function SelectStyle({ value, onChange }: SelectStyleProps) {
    const _onChange = (ev: ChangeEvent<HTMLSelectElement>) => {
        onChange(ev.target.value)
    }
    return (
        <Select value={value} onChange={_onChange}>
            <option value='André Malraux'>André Malraux</option>
            <option value='Federico García Lorca'>Federico García Lorca</option>
            <option value='Alexandre Dumas'>Alexandre Dumas</option>
            <option value='John Steinbeck'>John Steinbeck</option>
            <option value='Victor Hugo'>Victor Hugo</option>
            <option value='Harold Pinchbeck'>Harold Pinchbeck</option>
            <option value='Eminem'>Eminem</option>
            <option value='Snoop Dogg'>Snoop Dogg</option>
            <option value='30 years old office worker'>30 years old office worker</option>
            <option value='40 years old office worker'>40 years old office worker</option>
            <option value='50 years old manager'>50 years old manager</option>
            <option value='college student'>college student</option>
            <option value='sales associate'>sales associate</option>
        </Select>
    )
}