import { Avatar, Box, Flex, HStack, Heading } from "@chakra-ui/react";
import { MdLightbulbOutline, MdOutlineVolumeUp } from "react-icons/md";
import JpText from "../../components/JpText";
import StyledIconButton from "../../components/StyledIconButton";
import DefaultBlinkingCursor from "../../components/ellipsis-anim/DefaultBlinkingCursor";
import { IConversation, IMessage, MessageOrigin, MessageStatus } from "../../types";
import MessageBox from "./MessageBox";
import { useContext } from "react";
import { ExplainContext } from "../explain/ExplainContextProvider";


interface MessageViewProps {
    message: IMessage;
    conversation: IConversation;
}
export default function MessageView({ message, conversation }: MessageViewProps) {
    const isAssistant = message.origin === MessageOrigin.assistant;
    const title = isAssistant ? 'Assistant:' : 'You:';
    const doExplain = useContext(ExplainContext);

    const onPronunciation = () => {
        window.alert('TODO');
    }

    const avatar = isAssistant ?
        <Avatar size='xs' src="/bot.png" />
        :
        <Avatar size='sm' />;

    const isActive = message.status === MessageStatus.active;
    const isPending = message.status === MessageStatus.pending;

    const isJp = conversation.study_language === 'ja';
    console.log("call depuis MessageView")

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
                        <StyledIconButton title='Explain' icon={<MdLightbulbOutline />} onClick={() => doExplain({content: message.content, messageId: message.id})} />
                    </HStack>
                }
            </Flex>
            <Box whiteSpace='pre-line'>
                {isJp ? <JpText text={message.content} /> : <MessageText text={message.content} />}
                {isPending && <DefaultBlinkingCursor />}
            </Box>
        </MessageBox>
    )
}


interface MessageTextProps {
    text: string;
}
function MessageText({ text }: MessageTextProps) {
    return <span>{text}</span>
}
