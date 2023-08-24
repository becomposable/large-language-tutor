import BlinkingCursor from "./BlinkingCursor";


interface DefaultBlinkingCursorProps {
}
export default function DefaultBlinkingCursor({ }: DefaultBlinkingCursorProps) {
    return (
        // &#9646; vertical filled rectangle
        // &#124; vertical line
        <BlinkingCursor shape="&#124;" fontSize='20px' fontWeight='blod' px='2' />
    )
}