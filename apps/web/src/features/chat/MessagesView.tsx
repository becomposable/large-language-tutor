import { Flex } from "@chakra-ui/react";
import EllipsisAnim from "../../components/ellipsis-anim/EllipsisAnim";
import { IMessage, MessageStatus } from "../../types";
import MessageBox from "./MessageBox";
import MessageStreamView from "./MessageStreamView";
import MessageView from "./MessageView";

interface MessagesViewProps {
    messages: IMessage[];
    isPending: boolean;
}
export default function MessagesView({ messages, isPending }: MessagesViewProps) {
    return (
        <Flex px='4' py='2' direction='column'>
            {
                messages.map(m => {
                    if (m.status === MessageStatus.created) {
                        return <MessageStreamView key={m.id} message={m} />
                    } else {
                        return <MessageView key={m.id} message={m} />
                    }
                })
            }
            {isPending && <PendingMessageBox />}
        </Flex>
    )
}

function PendingMessageBox() {
    return (
        <MessageBox display='flex' justifyContent='center' alignItems='center'>
            <EllipsisAnim fontSize='24px' />
        </MessageBox>
    )
}
