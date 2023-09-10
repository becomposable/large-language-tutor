import { Avatar, Box, Flex, HStack, Heading, Spacer, Text, VStack } from "@chakra-ui/react";
import { VerifyContentResult } from "@language-tutor/types";
import { useContext, useEffect, useState } from "react";
import { MdCheckCircle, MdLightbulbOutline, MdOutlineError, MdOutlineVolumeUp } from "react-icons/md";
import JpText from "../../components/JpText";
import StyledIconButton from "../../components/StyledIconButton";
import DefaultBlinkingCursor from "../../components/ellipsis-anim/DefaultBlinkingCursor";
import { useUserSession } from "../../context/UserSession";
import { IConversation, IMessage, MessageOrigin, MessageStatus } from "../../types";
import { ExplainContext } from "../explain/ExplainContextProvider";
import MessageBox from "./MessageBox";


interface MessageViewProps {
    message: IMessage;
    conversation: IConversation;
}
export default function MessageView({ message, conversation }: MessageViewProps) {
    const { client } = useUserSession();
    const isAssistant = message.origin === MessageOrigin.assistant;
    const title = isAssistant ? 'Assistant:' : 'You:';
    const doExplain = useContext(ExplainContext);
    const [verification, setVerification] = useState<VerifyContentResult | undefined>(message.verification);   
    const [showCorrection, setShowCorrection] = useState<boolean>(false);

    const onPronunciation = () => {
        window.alert('TODO');
    }

    const avatar = isAssistant ?
        <Avatar size='xs' src="/bot.png" />
        :
        <Avatar size='sm' />;

    const isActive = message.status === MessageStatus.active;
    const isPending = message.status === MessageStatus.pending;


    useEffect(() => {
        if (message.verification) return; //don't run if the message already has a verification
        if (message.origin !== MessageOrigin.user) return; //don't run on assistant messages
        if (isPending) return; //don't run as long as the message isn't finished
        console.log("calling verify", message, message.verification)

        client.get(`/messages/${message.id}/verify`).then((response) => {
            console.log("verify response", response);
            setVerification(response);
        }).catch((error) => {
            console.error(error);
        });

    }, [isPending, message.id]);


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
                    isActive &&
                    <HStack>
                        <StyledIconButton title='Pronunciation' icon={<MdOutlineVolumeUp />} onClick={onPronunciation} />
                        <StyledIconButton title='Explain' icon={<MdLightbulbOutline />} onClick={() => doExplain({content: message.content, messageId: message.id})} />
                    </HStack>
                }
            </Flex>
            <HStack>
            <Box whiteSpace='pre-line'>
                {isJp ? <JpText text={message.content} /> : <MessageText text={message.content} />}
                {isPending && <DefaultBlinkingCursor />}
            </Box>
            <Spacer />
            {(!isPending && verification) && 
                <CorrectionIcon verification={verification} show={showCorrection} setShowCorrection={setShowCorrection} />
            }
            </HStack>
            {showCorrection && <Correction verification={message.verification}/>}
        </MessageBox>
    )
}

function CorrectionIcon({ verification, show, setShowCorrection }: { verification: VerifyContentResult, show: boolean, setShowCorrection: (show: boolean) => void }) {

    if (verification.is_correct) return <Box padding={3} color='green.400'><MdCheckCircle/></Box>;

    const color = () => {
        switch (verification.importance) {
            case 'low': return 'blue.300';
            case 'medium': return 'orange.300';
            case 'high': return 'red.300';
        }
    }

    return (
        <Box>
            <StyledIconButton
                title='Correction' 
                icon={<MdOutlineError />} 
                color={color()}
                onClick={() => setShowCorrection(!show)}
            />
        </Box>
    )

}

function Correction({ verification }: { verification: VerifyContentResult }) {
    return (
        <VStack align={'left'}>
            <Text color='green.400'>{verification.correction}</Text>
            <Text color='gray.500'>{verification.explanation}</Text>
        </VStack>

    )
}

interface MessageTextProps {
    text: string;
}
function MessageText({ text }: MessageTextProps) {
    return <span>{text}</span>
}
