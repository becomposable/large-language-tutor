import { AddIcon } from "@chakra-ui/icons";
import { Button, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Portal, Select, Spinner, useDisclosure, useToast } from "@chakra-ui/react";
import { ChangeEvent, SyntheticEvent, useEffect, useState } from "react";
import StyledIconButton from "../../components/StyledIconButton";
import { Languages } from "../../types";
import { useUserSession } from "../../context/UserSession";
import { useNavigate } from "react-router";
import { StoryOptions } from "@language-tutor/types";


interface CreateStoryModalProps {
}

export default function CreateStoryModal({ }: CreateStoryModalProps) {
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
    const [style, setStyle] = useState<string>("");
    const [level, setLevel] = useState<string>("beginner");
    const [topic, setTopic] = useState<string>("");
    const [type, setType] = useState<string>("story");
    const [options, setOptions] = useState<StoryOptions|undefined>(undefined);
    const [isLoading, setLoading] = useState<boolean>(false);
    const { client } = useUserSession();
    const toast = useToast({ isClosable: true, duration: 90000 });
    const navigate = useNavigate();

    const onChangeTopic = (ev: ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
        setTopic(ev.target.value);
    }

    useEffect(() => {

        if (!userLanguage || !studyLanguage) {
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
        })
    }, [userLanguage, studyLanguage]);

    const onSubmit = () => {
        setLoading(true);
        client.post('/stories', {
            payload: {
                user_language: userLanguage,
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
                <FormControl mb='4'>
                    <FormLabel>User Language</FormLabel>
                    <SelectLanguage value={userLanguage} onChange={setUserLanguage} />
                </FormControl>
                <FormControl>
                    <FormLabel>Study Language</FormLabel>
                    <SelectLanguage value={studyLanguage} onChange={setStudyLanguage} />
                </FormControl>
            { options ?
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
                : <Spinner />
                } 

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
            <option value='JA'>Japanese</option>
            <option value='EN'>English</option>
            <option value='FR'>French</option>
            <option value='RO'>Romanian</option>
            <option value='DE'>German</option>
            <option value='ES'>Spanish</option>
            <option value='IT'>Italian</option>
            <option value='PT'>Portuguese</option>
            <option value='EL'>Greek</option>
            <option value='BG'>Bulgarian</option>
            <option value='CS'>Czech</option>
            <option value='UK'>Ukrainian</option>
            <option value='ZH'>Chinese</option>
            <option value='KO'>Korean</option>
            <option value='AR'>Arabic</option>
            <option value='TR'>Turkish</option>
            <option value='HI'>Hindi</option>
            <option value='ID'>Indonesian</option>
            <option value='VI'>Vietnamese</option>
            <option value='TH'>Thai</option>
            <option value='PL'>Polish</option>
            <option value='NL'>Dutch</option>
            <option value='SV'>Swedish</option>
            <option value='FI'>Finnish</option>
            <option value='DA'>Danish</option>
        </Select>
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