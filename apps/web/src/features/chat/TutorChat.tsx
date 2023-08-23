import { Box, FormControl, IconButton, Input, useToast } from "@chakra-ui/react";
import { ChangeEvent, SyntheticEvent, useEffect, useState } from "react";
import { MdSend } from "react-icons/md";
import ErrorAlert from "../../components/ErrorAlert";
import { useUserSession } from "../../context/UserSession";
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

    const onSubmit = (ev: SyntheticEvent) => {
        ev.stopPropagation();
        ev.preventDefault();
        const content = question.trim();
        if (content) {
            setPending(true);
            client.post('/messages', {
                payload: {
                    conversation: conversationId,
                    content: question,
                    stream: true
                }
            }).then(r => {
                setData(messages!.concat(r));
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

    if (error) {
        return <ErrorAlert title='Failed to fetch messages'>{error.message}</ErrorAlert>
    }

    return (
        <Box>
            <MessagesView messages={messages || []} isPending={pending} />
            <form onSubmit={onSubmit} noValidate autoComplete="off">
                <FormControl display='flex' mt='2'>
                    <Input autoComplete="off" placeholder="Type a question" value={question} onChange={onQuestionChanged} />
                    <IconButton aria-label="Send" title="Send" icon={<MdSend />} type='submit' />
                </FormControl>
            </form>
        </Box>
    )
}