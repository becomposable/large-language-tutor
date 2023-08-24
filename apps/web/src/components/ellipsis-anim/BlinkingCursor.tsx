import { Box, BoxProps } from "@chakra-ui/react";
import "./blinking-cursor.css"

interface BlinkingCursorProps extends BoxProps {
    shape: string;
}
export default function BlinkingCursor({ shape, ...props }: BlinkingCursorProps) {
    return (
        <Box {...props} as='span' className="blinking-cursor">{shape}</Box>
    )
}
