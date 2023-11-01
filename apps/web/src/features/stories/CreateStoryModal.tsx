import { AddIcon } from "@chakra-ui/icons";
import { Button, FormControl, FormHelperText, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Portal, Select, useDisclosure, useToast } from "@chakra-ui/react";
import { StoryOptions } from "@language-tutor/types";
import { ChangeEvent, SyntheticEvent, useState } from "react";
import { useNavigate } from "react-router";
import LanguageSelector from "../../components/LanguageSelector";
import StyledIconButton from "../../components/StyledIconButton";
import { useUserSession } from "../../context/UserSession";


export default function CreateStoryModal() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const onOpenModal = (e: SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onOpen();
    }
    return (
        <>
            <StyledIconButton
                title='Create a Story'
                icon={<AddIcon />}
                onClick={onOpenModal}
            />
            <Portal>
                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Create a Story</ModalHeader>
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
    const [studyLanguage, setStudyLanguage] = useState<string|undefined>(undefined);
    const [style, setStyle] = useState<string>("");
    const [level] = useState<string>("beginner");
    const [topic, setTopic] = useState<string>("");
    const [type, setType] = useState<string>("story");
    const [options, setOptions] = useState<StoryOptions|undefined>(undefined);
    const [isLoading, setLoading] = useState<boolean>(false);
    const { client } = useUserSession();
    const toast = useToast({ isClosable: true, duration: 90000 });
    const navigate = useNavigate();
    const { user } = useUserSession();

    const onChangeTopic = (ev: ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
        setTopic(ev.target.value);
    }

    const onSubmit = () => {
        if (options) {
            getStories();
        } else {
            getOptions();
        }
    }

    const getOptions = () => {

        if (!user?.language || !studyLanguage) {
            toast({
                status: 'error',
                title: 'Select a language in your profile',
                description: 'Clic on your name in the top right corner and open Settings to select a language.'
            })

            return;
        }

        setLoading(true);
        client.get('/stories/options').then(r => {
            console.log(r);
            setOptions(r.data);
            setLoading(false);
        }).catch(err => {
            toast({
                status: 'error',
                title: 'Failed to fetch options',
                description: err.message
            })
        }).finally(() => {
            setLoading(false);
        }); 
    };

    const onSelectLanguage = (language: string) => {
        console.log(language + "selected");
        if (language === studyLanguage) {
            return;
        } else {
            setOptions(undefined);
            setStudyLanguage(language);
        }
    }

    const getStories = () => {
        setLoading(true);
        client.post('/stories', {
            payload: {
                user_language: user?.language,
                study_language: studyLanguage,
                style: style,
                level: level,
                topic: topic,
                type: type,
                blocking: false // do not generate the storyt now but when the story page will be loaded
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
                <FormControl>
                    <FormLabel>Study Language</FormLabel>
                    <FormHelperText py={2} pb={4}>Select a language and the system will generate options for you. 
                        Options change all the time and adapted to your experience.
                        It will take 10-15sec to generate.
                    </FormHelperText>
                    <LanguageSelector value={studyLanguage} onChange={onSelectLanguage} />
                </FormControl>
            { (options && !isLoading) &&
                <>
                <FormControl>
                    <FormLabel>Type</FormLabel>
                    <OptionsSelect value={type} options={options.types} onChange={setType} />
                </FormControl>
                <FormControl>
                    <FormLabel>About the topic</FormLabel>
                    <OptionsSelect value={topic} options={options.topics} onChange={setTopic} />
                    or type your own
                    <Input value={topic} onChange={onChangeTopic} />
                </FormControl>
                <FormControl>
                    <FormLabel>In the style of</FormLabel>
                    <OptionsSelect value={style} options={options.styles} onChange={setStyle} />
                </FormControl>
                </>
                }
            </ModalBody>
            <ModalFooter>
                <Button variant='ghost' mr={3} onClick={onClose}>
                    Close
                </Button>
                <Button isLoading={isLoading} colorScheme='blue' onClick={onSubmit} >{options ? 'Generate Story' : 'Get Options'}</Button>
            </ModalFooter>
        </>
    )
}


interface OptionsSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
}

function OptionsSelect({ value, options, onChange }: OptionsSelectProps) {
    const _onChange = (ev: ChangeEvent<HTMLSelectElement>) => {
        onChange(ev.target.value)
    }
    return (
        <Select value={value} onChange={_onChange}>
            {options.map(o => <option value={o}>{o}</option>)}
        </Select>
    )
}