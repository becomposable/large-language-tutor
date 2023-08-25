import { Box, Button, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, UnorderedList, VStack } from "@chakra-ui/react";
import Kuroshiro from "@language-tutor/kuroshiro";
import { SyntheticEvent, useEffect, useState } from "react";
import { IJapaneseWord, IpadicFeatures, tokenizeJapaneseWords } from "../../hooks/kurojomi";
import "./jp-word.css";

export default function JpText({ text }: { text: string }) {
    const [parseResult, setParseResult] = useState<{ words: IJapaneseWord[], tokens: IpadicFeatures[] }>();
    const [children, setChildren] = useState<JSX.Element[]>();
    const [word, setWord] = useState<IJapaneseWord | undefined>(undefined);

    const onClick = (ev: SyntheticEvent<HTMLElement>) => {
        const el = ev.target as HTMLElement;
        if (el.classList.contains('jp-word')) {
            const dataIndex = el.getAttribute("data-index");
            if (dataIndex) {
                ev.stopPropagation();
                ev.preventDefault();
                const index = parseInt(dataIndex);
                const word = parseResult?.words[index];
                if (word) {
                    //console.log("Looking at word " + word.text, word)
                    setWord(word);
                }
            }
        }
    }

    useEffect(() => {
        tokenizeJapaneseWords(text).then((result) => {
            const children = result.words.map((word, i) => {
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
            setParseResult(result);
            setChildren(children);
        }
        );
    }, [text]);

    return (
        <>
            {children ? <Box as='span' onClick={onClick}>{children}</Box> : <span>{text}</span>}
            <JpWordModal tokens={parseResult ? parseResult.tokens : []} word={word} setWord={setWord} />
        </>
    );

}

//make a modal that opens when clicking on a word
//show the word, the reading, and the definition
function JpWordModal({ tokens, word, setWord }: {
    tokens: IpadicFeatures[],
    word: IJapaneseWord | undefined,
    setWord: (word?: IJapaneseWord) => void
}) {
    const jotoba = "https://jotoba.de/api/search/words"
    const query = {
        query: word?.text,
    }
    const [def, setDef] = useState<any>();
    const [hiragamaText, setHiragamaText] = useState<string>();

    useEffect(() => {
        if (tokens && tokens.length) {
            const hiragamaText = new Kuroshiro().convertTokens(tokens, {
                mode: "normal",
                to: "hiragana"
            }).then(setHiragamaText);
        }
    }, [tokens]);

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
        setWord(undefined);
    };

    return word && (
        <Modal isOpen={!!word} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{word.text}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack align='start'>
                        <Box>Reading: {hiragamaText} ({def?.words[0].reading?.kana ?? word.text})</Box>
                        <Box>Definition:
                            <UnorderedList>
                                {def?.words[0].senses.map((sense: any, index: number) => {
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
