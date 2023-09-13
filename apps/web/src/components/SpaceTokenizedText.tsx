import { useContext, useState } from "react";
import { ExplainContext } from "../features/explain/ExplainContextProvider";




export default function SpaceTokenizedText({ text }: { text: string }) {

    return (
        <>
            {text.split(' ').map((word, i) => {
                return (
                    <>
                        <Word word={word} />
                        <span> </span>
                    </>
                )
            })}
        </>
    );

}

function Word({ word }: { word: string }) {
    const doExplain = useContext(ExplainContext);
    const [isHover, setIsHover] = useState(false);

    const wordStyle = {
        backgroundColor: isHover ? 'lightyellow' : 'transparent',
        cursor: 'pointer'
    }
    return (
        <span
            style={wordStyle}
            onClick={() => doExplain({ content: word })}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            className='word'>
            {word}
        </span>
    )
}