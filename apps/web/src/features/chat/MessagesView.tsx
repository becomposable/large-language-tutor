import { Box, Flex } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { IConversation, IMessage, MessageStatus } from "../../types";
import MessageStreamView from "./MessageStreamView";
import MessageView from "./MessageView";

interface MessagesViewProps {
    messages: IMessage[];
    conversation: IConversation;
}
export default function MessagesView({ messages, conversation }: MessagesViewProps) {
    const [isFirstRender, setIsFirstRender] = useState<boolean>(true);
    const scrollTargetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isFirstRender) {
            // hack to avoid smooth scroll on first render
            window.setTimeout(() => {
                setIsFirstRender(false);
            }, 1000);
        }
        onAdjustScroll(isFirstRender);
    }, [messages]);

    const onAdjustScroll = (isFirstRender = false) => {
        scrollTargetRef.current?.scrollIntoView({ behavior: isFirstRender ? 'instant' : 'smooth', block: 'end' });
    }

    return (
        <Box w='100%'>
            <Flex px='4' py='2' direction='column'>
                {
                    messages.map(m => {
                        if (m.status === MessageStatus.created) {
                            return <MessageStreamView key={m.id} message={m} onAdjustScroll={onAdjustScroll} conversation={conversation} />
                        } else {
                            return <MessageView key={m.id} message={m} conversation={conversation} />
                        }
                    })
                }
            </Flex>
            <Box ref={scrollTargetRef} position='relative' h='8rem' w='100%' />
        </Box>
    )
}
