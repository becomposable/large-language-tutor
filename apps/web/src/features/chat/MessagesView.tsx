import { Avatar, Box, BoxProps, Flex, HStack, Heading } from "@chakra-ui/react";
import EllipsisAnim from "../../components/ellipsis-anim/EllipsisAnim";
import { IMessage, MessageOrigin } from "../../types";
import StyledIconButton from "../../components/StyledIconButton";
import { MdHelp, MdHelpOutline, MdOutlineHelpOutline, MdOutlineVolumeUp } from "react-icons/md";

interface MessagesViewProps {
    messages: IMessage[];
    isPending: boolean;
}
export default function MessagesView({ messages, isPending }: MessagesViewProps) {
    return (
        <Flex px='4' py='2' direction='column'>
            {messages.map(m => <MessageView key={m.id} message={m} />)}
            {isPending && <MessageBox>
                <EllipsisAnim fontSize='24px' />
            </MessageBox>}

        </Flex>
    )
}

interface MessageViewProps {
    message: IMessage;
}
function MessageView({ message }: MessageViewProps) {
    const isAssistant = message.origin === MessageOrigin.assistant;
    const title = isAssistant ? 'Assistant:' : 'You:';

    const onPronunciation = () => {
        window.alert('TODO');
    }

    const onExplain = () => {
        window.alert('TODO');
    }

    const avatar = isAssistant ?
        <Avatar size='xs' src="/bot.png" />
        :
        <Avatar size='sm' />;
    return (
        <MessageBox>
            <Flex justify='space-between' align='center' w='100%' mb='4'>
                <Heading size='sm' display='flex' alignItems='center' justifyContent='start'>
                    {avatar}
                    <Box ml='4'>{title}</Box>
                </Heading>
                <HStack>
                    <StyledIconButton title='Pronunciation' icon={<MdOutlineVolumeUp />} onClick={onPronunciation} />
                    <StyledIconButton title='Explain' icon={<MdOutlineHelpOutline />} onClick={onExplain} />
                </HStack>
            </Flex>
            <Box>{message.content}</Box>
        </MessageBox>
    )
}

interface MessageBoxProps extends BoxProps {
}
function MessageBox({ children, ...props }: MessageBoxProps) {
    return (
        <Box {...props} position='relative' my='2' px='2' py='2' border='1px solid' borderColor='gray.100'
            _hover={{
                borderColor: 'gray.400'
            }}>
            <div>{children}</div>
            <Box position='absolute' right=''></Box>
        </Box>
    )
}

