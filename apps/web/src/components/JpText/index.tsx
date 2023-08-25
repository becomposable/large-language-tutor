import { SyntheticEvent, useEffect, useState } from "react";
import { IJapaneseWord, tokenizeJapaneseWords } from "../../hooks/kurojomi";
import "./jp-word.css";
import { Box } from "@chakra-ui/react";

export default function JpText({ text }: { text: string }) {
    const [words, setWords] = useState<IJapaneseWord[]>([]);
    const [children, setChildren] = useState<JSX.Element[]>();

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
                    window.alert(`TODO: ${word.text}`);
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
                    return <span className='jp-word' data-index={i} key={i}>{word.text}</span>
                }
            });
            setWords(words);
            setChildren(children);
        }
        );
    }, [text]);

    return children ? <Box as='span' onClick={onClick}>{children}</Box> : <span>{text}</span>;

}
