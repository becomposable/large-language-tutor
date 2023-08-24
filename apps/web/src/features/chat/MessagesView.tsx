import { Box, Flex } from "@chakra-ui/react";
import EllipsisAnim from "../../components/ellipsis-anim/EllipsisAnim";
import { IMessage, MessageStatus } from "../../types";
import MessageBox from "./MessageBox";
import MessageStreamView from "./MessageStreamView";
import MessageView from "./MessageView";
import { useEffect, useRef } from "react";

interface MessagesViewProps {
    messages: IMessage[];
    isPending: boolean;
}
export default function MessagesView({ messages, isPending }: MessagesViewProps) {
    const scrollTargetRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        onAdjustScroll();
    }, [messages, isPending]);

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
                {isPending && <PendingMessageBox />}
            </Flex>
            <Box ref={scrollTargetRef} position='relative' h='8rem' w='100%' />
        </Box>
    )
}

function PendingMessageBox() {
    return (
        <MessageBox display='flex' justifyContent='center' alignItems='center'>
            <EllipsisAnim fontSize='24px' />
        </MessageBox>
    )
}
