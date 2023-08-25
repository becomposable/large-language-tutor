import { SyntheticEvent, useEffect, useState } from "react";
import { IJapaneseWord, tokenizeJapaneseWords } from "../../hooks/kurojomi";
import "./jp-word.css";
import { Box, Button, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, UnorderedList, VStack } from "@chakra-ui/react";

export default function JpText({ text }: { text: string }) {
    const [words, setWords] = useState<IJapaneseWord[]>([]);
    const [children, setChildren] = useState<JSX.Element[]>();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [word, setWord] = useState<IJapaneseWord | undefined>(undefined);

    const onClick = (ev: SyntheticEvent<HTMLElement>) => {
        const el = ev.target as HTMLElement;
        if (el.classList.contains('jp-word')) {
            const dataIndex = el.getAttribute("data-index");
            if (dataIndex) {
                ev.stopPropagation();
                ev.preventDefault();
                const index = parseInt(dataIndex);
                const word = words[index];
                if (word) {
                    //console.log("Looking at word " + word.text, word)
                    setWord(word);
                    setShowModal(true);
                }
            }
        }
    }

    useEffect(() => {
        tokenizeJapaneseWords(text).then(({ words }) => {
            const children = words.map((word, i) => {
                if (word.unknown) {
                    return <span key={i} data-index={i}>{word.text}</span>
                } else {
                    return (
                        <span
                            className='jp-word' data-index={i} key={i}
                            title={word.tokens.map(t => t.reading).join('')}>{word.text}
                        </span>
                    )
                }
            });
            setWords(words);
            setChildren(children);
        }
        );
    }, [text]);

    return (
        <>
            {children ? <Box as='span' onClick={onClick}>{children}</Box> : <span>{text}</span>}
            <JpWordModal word={word} setWord={setWord} showModal={showModal} setShowModal={setShowModal} />
        </>
    );

}

//make a modal that opens when clicking on a word
//show the word, the reading, and the definition
function JpWordModal({ word, setWord, showModal, setShowModal }: { word: IJapaneseWord | undefined, setWord: (word?: IJapaneseWord) => void, showModal: boolean, setShowModal: (show: boolean) => void }) {
    const jotoba = "https://jotoba.de/api/search/words"
    const query = {
        query: word?.text,
    }
    const [def, setDef] = useState<any>();

    useEffect(() => {
        if (!word) return;
        //fetch the definition
        //console.log("fetching definition for", word.text)

        fetch(jotoba, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(query)
        }).then(res => {
            res.json().then(json => {
                //console.log("json", json)
                setDef(json)
            })
        }).catch(err => {
            console.error("Failed to fetch definition", err)
        });
    }, [word]);

    const onClose = () => {
        setShowModal(false);
        setWord(undefined);
    };
    const isOpen = showModal;

    return (showModal && word && def?.words) && (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{word.text}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack align='start'>
                        <Box>Reading: {def.words[0].reading?.kana ?? word.text}</Box>
                        <Box>Definition:
                            <UnorderedList>
                                {def.words[0].senses.map((sense: any, index: number) => {
                                    return <ListItem key={index}>{sense.glosses.join(', ')}</ListItem>
                                })}
                            </UnorderedList>
                        </Box>
                    </VStack>
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
