import { DeleteIcon } from "@chakra-ui/icons";
import { Flex, IconButton, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import ErrorAlert from "../../components/ErrorAlert";
import { useUserSession } from "../../context/UserSession";
import useFetchOnce from "../../hooks/useFetch";
import { IConversation } from "../../types";
import dayjs from "dayjs";

export default function ConversationsView() {
    const { client } = useUserSession();
    const { data: conversations, error } = useFetchOnce<IConversation[]>(() => {
        return client.get('/conversations');
    }, {
        defaultValue: []
    });

    if (error) {
        return <ErrorAlert title='Failed to fetch conversations'>{error.message}</ErrorAlert>
    }

    return (
        <VStack w='100%' align='start' justify='start' spacing='4'>
            {conversations && conversations.map(c => <ConversationItem key={c.id} conversation={c} />)}
        </VStack>
    )
}


interface ConversationItemProps {
    conversation: any;
}
function ConversationItem({ conversation }: ConversationItemProps) {
    return (
        <Flex p='4' borderBottom='1px solid' borderBottomColor='gray.100' w='100%'
            justify='space-between'>
            <Link to={`/conversations/${conversation.id}`}>
                {conversation.study_language} practice - initiated on {dayjs(conversation.created_at).format('DD/MM/YYYY')}    
            </Link>
            <IconButton aria-label='delete' icon={<DeleteIcon />} />
        </Flex >
    )
}