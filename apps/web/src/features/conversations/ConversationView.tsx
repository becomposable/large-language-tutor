import { Box, Flex, Heading } from "@chakra-ui/react";
import { useUserSession } from "../../context/UserSession";
import { useFetch } from "../../hooks/useFetch";
import { IConversation } from "../../types";
import TutorChat from "../chat/TutorChat";
import { EditIcon } from "@chakra-ui/icons";
import StyledIconButton from "../../components/StyledIconButton";
import { getConversationTitle } from "./utils";


interface ConversationViewProps {
    conversationId: string;
}
export default function ConversationView({ conversationId }: ConversationViewProps) {
    const { client } = useUserSession();
    const { data: conversation, error } = useFetch<IConversation>(() => {
        return client.get(`/conversations/${conversationId}`)
    }, {
        deps: [conversationId]
    });

    const onEdit = () => {
        window.alert('TODO');
    }

    return (
        <Box w='100%'>
            <Flex justify='space-between' align='center' w='100%' px='4'>
                <Heading size='md' display='flex' alignItems='center'>
                    <Box>{getConversationTitle(conversation)}</Box>
                    <StyledIconButton ml='4' icon={<EditIcon />} title='Edit conversation title' onClick={onEdit} />
                </Heading>
                <Box>Language: <b>{conversation?.study_language}</b></Box>
            </Flex>
            {conversation && <TutorChat conversation={conversation} />}
        </Box >
    )

}