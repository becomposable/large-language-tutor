import { useEffect, useState } from "react";
import { useUserSession } from "../../context/UserSession";
import { IMessage, MessageStatus } from "../../types";
import MessageView from "./MessageView";

interface MessageStreamViewProps {
    message: IMessage;
}
export default function MessageStreamView({ message }: MessageStreamViewProps) {

    const { client } = useUserSession();
    const [content, setContent] = useState<string>('');
    const [completedMessage, setCompletedMessage] = useState<IMessage>();

    useEffect(() => {
        const chunks: string[] = [];
        const sse = new EventSource(client.getUrl(`/messages/sse/${message.id}`));
        sse.addEventListener("message", ev => {
            const data = JSON.parse(ev.data);
            if (data) {
                chunks.push(data);
                setContent(chunks.join(''))
            }
        });
        sse.addEventListener("close", (ev) => {
            sse.close();
            const msg = JSON.parse(ev.data)
            setCompletedMessage(msg);
        });
        return () => {
            sse.close();
        }
    }, [])

    const actualMessage = completedMessage ? completedMessage : {
        ...message,
        content: content,
        status: MessageStatus.pending
    }

    return <MessageView message={actualMessage} />
}
