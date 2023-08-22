import { Box } from "@chakra-ui/react";
import "./ellipsis-anim.css"

interface EllipsisAnimProps {
    fontSize: string;
}
export default function EllipsisAnim({ fontSize }: EllipsisAnimProps) {
    return (
        <Box as='span' className="ellipsis-anim" fontSize={fontSize}>
            <span>&bull;</span>
            <span>&bull;</span>
            <span>&bull;</span>
        </Box>
    )
}