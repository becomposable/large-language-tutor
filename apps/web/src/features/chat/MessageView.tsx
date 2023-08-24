import { Avatar, Box, Center, Flex, HStack, Heading } from "@chakra-ui/react";
import { IMessage, MessageOrigin, MessageStatus } from "../../types";
import MessageBox from "./MessageBox";
import StyledIconButton from "../../components/StyledIconButton";
import { MdLightbulb, MdLightbulbOutline, MdOutlineHelpOutline, MdOutlineVolumeUp } from "react-icons/md";
import EllipsisAnim from "../../components/ellipsis-anim/EllipsisAnim";

interface MessageViewProps {
    message: IMessage;
}
export default function MessageView({ message }: MessageViewProps) {
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

    const isActive = message.status === MessageStatus.active;
    const isPending = message.status === MessageStatus.pending;

    return (
        <MessageBox>
            <Flex justify='space-between' align='center' w='100%' mb='4'>
                <Heading size='sm' display='flex' alignItems='center' justifyContent='start'>
                    {avatar}
                    <Box ml='4'>{title}</Box>
                </Heading>
                {
                    isActive && <HStack>
                        <StyledIconButton title='Pronunciation' icon={<MdOutlineVolumeUp />} onClick={onPronunciation} />
                        <StyledIconButton title='Explain' icon={<MdLightbulbOutline />} onClick={onExplain} />
                    </HStack>
                }
            </Flex>
            <Box>{message.content}</Box>
            {
                isPending && <Center><EllipsisAnim fontSize='24px' /></Center>
            }
        </MessageBox>
    )
}

