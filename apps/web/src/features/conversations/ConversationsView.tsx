import { Box, Flex, IconButton, VStack } from "@chakra-ui/react";
import { useUserSession } from "../../context/UserSession";
import useFetchOnce from "../../hooks/useFetch";
import ErrorAlert from "../../components/ErrorAlert";
import { IConversation } from "../../types";
import { Link } from "react-router-dom";
import { DeleteIcon } from "@chakra-ui/icons";

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
            <Link to={`/conversations/${conversation.id}`}>{conversation.created}</Link>
            <IconButton aria-label='delete' icon={<DeleteIcon />} />
        </Flex >
    )
}