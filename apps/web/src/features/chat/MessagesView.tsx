import { Box, Center, Flex } from "@chakra-ui/react";
import { IMessage } from "../../types";
import EllipsisAnim from "../../components/ellipsis-anim/EllipsisAnim";


interface MessagesViewProps {
    messages: IMessage[];
    isPending: boolean;
}
export default function MessagesView({ messages, isPending }: MessagesViewProps) {
    return (
        <Flex px='4' py='2' direction='column'>
            {messages.map(m => <MessageBox key={m.id} message={m} />)}
            {isPending && <Center my='2' px='2' border='1px solid' borderColor='gray.100'>
                <EllipsisAnim fontSize='24px' />
            </Center>}

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
