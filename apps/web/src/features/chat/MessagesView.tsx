import { Box, Flex } from "@chakra-ui/react";
import { IMessage } from "../../types";


interface MessagesViewProps {
    messages: IMessage[];
}
export default function MessagesView({ messages }: MessagesViewProps) {
    return (
        <Flex px='4' py='2' direction='column'>
            {messages.map(m => <MessageBox key={m.id} message={m} />)}
        </Flex>
    )
}


interface MessageBoxProps {
    message: IMessage
}
function MessageBox({ message }: MessageBoxProps) {
    return (
        <Box my='2' px='2' py='2' border='1px solid' borderColor='gray.100'
            _hover={{
                borderColor: 'gray.400'
            }}>{message.content}</Box>
    )
}
