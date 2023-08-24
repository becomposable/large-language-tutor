import { useEffect, useState } from "react";
import { useUserSession } from "../../context/UserSession";
import { IMessage, MessageStatus } from "../../types";
import MessageView from "./MessageView";

interface MessageStreamViewProps {
    message: IMessage;
    onAdjustScroll: () => void;
}
export default function MessageStreamView({ message, onAdjustScroll }: MessageStreamViewProps) {

    const { client } = useUserSession();
    const [content, setContent] = useState<string>('');
    const [completedMessage, setCompletedMessage] = useState<IMessage>();

    useEffect(() => {
        const chunks: string[] = [];
        const sse = new EventSource(client.getUrl(`/messages/${message.id}/stream`));
        sse.addEventListener("message", ev => {
            const data = JSON.parse(ev.data);
            if (data) {
                chunks.push(data);
                setContent(chunks.join(''))
                onAdjustScroll();
            }
        });
        sse.addEventListener("close", (ev) => {
            sse.close();
            const msg = JSON.parse(ev.data)
            setCompletedMessage(msg);
            onAdjustScroll();
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
