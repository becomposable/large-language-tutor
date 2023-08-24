import { Box, Flex } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { IMessage, MessageStatus } from "../../types";
import MessageStreamView from "./MessageStreamView";
import MessageView from "./MessageView";

interface MessagesViewProps {
    messages: IMessage[];
}
export default function MessagesView({ messages }: MessagesViewProps) {
    const scrollTargetRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        onAdjustScroll();
    }, [messages]);

    const onAdjustScroll = () => {
        scrollTargetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    return (
        <Box w='100%'>
            <Flex px='4' py='2' direction='column'>
                {
                    messages.map(m => {
                        if (m.status === MessageStatus.created) {
                            return <MessageStreamView key={m.id} message={m} onAdjustScroll={onAdjustScroll} />
                        } else {
                            return <MessageView key={m.id} message={m} />
                        }
                    })
                }
            </Flex>
            <Box ref={scrollTargetRef} position='relative' h='8rem' w='100%' />
        </Box>
    )
}
