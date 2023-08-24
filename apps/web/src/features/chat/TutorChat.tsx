import { Box, Flex, FormControl, IconButton, Input, useToast } from "@chakra-ui/react";
import { CSSProperties, ChangeEvent, SyntheticEvent, useEffect, useRef, useState } from "react";
import { MdSend } from "react-icons/md";
import ErrorAlert from "../../components/ErrorAlert";
import { useUserSession } from "../../context/UserSession";
import { useFetch } from "../../hooks/useFetch";
import { IConversation, IMessage } from "../../types";
import MessagesView from "./MessagesView";



interface TutorChatProps {
    conversation: IConversation;
}
export default function TutorChat({ conversation }: TutorChatProps) {
    const toast = useToast({ isClosable: true, duration: 90000 });
    const { client } = useUserSession();

    const { data: messages, setData, error } = useFetch<IMessage[]>(() => {
        return client.get(`/conversations/${conversation.id}/messages`)
    }, {
        defaultValue: [],
        deps: [conversation.id]
    });


    const onSubmit = (content: string) => {
        // window.setTimeout(() => {
        //     setData(messages!.concat([{
        //         id: '123',
        //         status: MessageStatus.active,
        //         content: content,
        //         conversation: conversationId,
        //         origin: MessageOrigin.user,
        //         created: new Date().toISOString()
        //     }, {
        //         id: '123',
        //         status: MessageStatus.active,
        //         content: "some response",
        //         conversation: conversationId,
        //         origin: MessageOrigin.assistant,
        //         created: new Date().toISOString()
        //     }]))
        //     setPending(false);
        // }, 3000);
        client.post('/messages', {
            payload: {
                conversation: conversation.id,
                content: content,
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
        });
    }

    if (error) {
        return <ErrorAlert title='Failed to fetch messages'>{error.message}</ErrorAlert>
    }

    return (
        <Box w='100%' position='relative'>
            <MessagesView messages={messages || []} conversation={conversation} />
            <ChatFooter onSubmit={onSubmit} />
        </Box>
    )
}


interface ChatFooterProps {
    onSubmit: (content: string) => void;
}
function ChatFooter({ onSubmit }: ChatFooterProps) {
    const [question, setQuestion] = useState('');
    const [style, setStyle] = useState<CSSProperties>({
        width: '0px',
        left: '0',
        bottom: '0',
    });
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        adjustPosition();
    }, [panelRef.current])

    const adjustPosition = () => {
        if (panelRef.current) {
            const el = panelRef.current;
            const rect = el.parentElement?.getBoundingClientRect();
            if (rect) {
                setStyle({
                    left: rect.left + 'px',
                    width: rect.width + 'px',
                    bottom: '0'
                });
            }
        }
    }

    const onQuestionChanged = (e: ChangeEvent<HTMLInputElement>) => {
        setQuestion(e.target.value);
    }

    const _onSubmit = (ev: SyntheticEvent) => {
        ev.stopPropagation();
        ev.preventDefault();
        const content = question.trim();
        if (content) {
            onSubmit(content);
            setQuestion('');
        }
    }

    return (
        <Flex style={style} ref={panelRef} position='fixed'
            h='8rem' px='10' py='10' align='center' justify='center'
            sx={{
                backgroundImage: "linear-gradient(180deg,hsla(0,0%,100%,0) 13.94%,#fff 54.73%)"
            }}
        >
            <Box as='form' onSubmit={_onSubmit} noValidate autoComplete="off" w='90%'>
                <FormControl display='flex' mt='2' bg='white'>
                    <Input autoComplete="off" placeholder="Type a question" value={question} onChange={onQuestionChanged} mr='1' />
                    <IconButton aria-label="Send" title="Send" icon={<MdSend />} type='submit' />
                </FormControl>
            </Box>
        </Flex>
    )
}