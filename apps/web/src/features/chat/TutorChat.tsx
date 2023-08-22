import { Box, FormControl, IconButton, Input, useToast } from "@chakra-ui/react";
import { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import { MdSend } from "react-icons/md";
import ErrorAlert from "../../components/ErrorAlert";
import { useUserSession } from "../../context/UserSession";
import { API_BASE_URL } from "../../env";
import FetchClient from "../../fetch-client";
import { useFetch } from "../../hooks/useFetch";
import { IMessage } from "../../types";
import MessagesView from "./MessagesView";

interface TutorChatProps {
    conversationId: string;
}
export default function TutorChat({ conversationId }: TutorChatProps) {
    const toast = useToast({ isClosable: true, duration: 90000 });
    const [question, setQuestion] = useState('');
    const [pending, setPending] = useState<boolean>(false);
    const { client } = useUserSession();

    const { data: messages, setData, error } = useFetch<IMessage[]>(() => {
        return client.get(`/conversations/${conversationId}/messages`)
    }, {
        defaultValue: [],
        deps: [conversationId]
    });

    const onQuestionChanged = (e: ChangeEvent<HTMLInputElement>) => {
        setQuestion(e.target.value);
    }

    const onAsk = () => {
        const content = question.trim();
        if (content) {
            setPending(true);
            new FetchClient(API_BASE_URL).post('/messages', {
                payload: {
                    conversation: conversationId,
                    content: question
                }
            }).then(r => {
                setData([...messages!, ...r]);
            }).catch(err => {
                toast({
                    status: 'error',
                    title: 'Failed to send message',
                    description: err.message
                })
            }).finally(() => {
                setPending(false);
            });
        }
        setQuestion('');
    }

    const onKeUp = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onAsk();
        }
    }

    if (error) {
        return <ErrorAlert title='Failed to fetch messages'>{error.message}</ErrorAlert>
    }

    //TODO meed to implement a session on server side in order to use this
    // useEffect(() => {
    //     console.log("TutorChat mounted");
    //     const sse = new EventSource(`${API_BASE_URL}/prompt`);
    //     sse.addEventListener("message", ({ data }) => {
    //         console.log('SSE>>>', data);
    //     });
    //     return () => {
    //         console.log("TutorChat unmounted");
    //         sse.close();
    //     }
    // }, []);

    return (
        <Box>
            <MessagesView messages={messages || []} isPending={pending} />
            <FormControl display='flex' mt='2'>
                <Input placeholder="Type a question" value={question} onChange={onQuestionChanged} onKeyUp={onKeUp} />
                <IconButton aria-label="Send" title="Send" icon={<MdSend />} onClick={onAsk} />
            </FormControl>
        </Box>
    )
}