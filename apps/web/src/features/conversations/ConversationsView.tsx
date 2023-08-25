import { DeleteIcon } from "@chakra-ui/icons";
import { Box, Flex, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import ErrorAlert from "../../components/ErrorAlert";
import StyledIconButton from "../../components/StyledIconButton";
import { useUserSession } from "../../context/UserSession";
import useFetchOnce from "../../hooks/useFetch";
import { IConversation } from "../../types";
import { getConversationTitle } from "./utils";
import StyledLink from "../../components/StyledLink";

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
    conversation: IConversation;
}
function ConversationItem({ conversation }: ConversationItemProps) {
    return (
        <Flex p='4' borderBottom='1px solid' borderBottomColor='gray.100' w='100%'
            align='baseline'
            justify='start'>
            <StyledLink to={`/conversations/${conversation.id}`}>{getConversationTitle(conversation)}</StyledLink>
            <Box ml='4' color='gray' fontWeight='bold' fontSize='smaller'>{conversation.study_language}</Box>
            <StyledIconButton ml='auto' aria-label='delete' hoverBg='red.100' icon={<DeleteIcon />} />
        </Flex >
    )
}