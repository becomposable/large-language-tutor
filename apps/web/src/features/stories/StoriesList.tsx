import { DeleteIcon } from "@chakra-ui/icons";
import { Flex, Text, VStack } from "@chakra-ui/react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import ErrorAlert from "../../components/ErrorAlert";
import StyledIconButton from "../../components/StyledIconButton";
import { useUserSession } from "../../context/UserSession";
import useFetchOnce from "../../hooks/useFetch";
import { IStory } from "../../types";

export default function StoriesList() {
    const { client } = useUserSession();
    const { data: stories, error } = useFetchOnce<IStory[]>(() => {
        return client.get('/stories');
    }, {
        defaultValue: []
    });

    if (error) {
        return <ErrorAlert title='Failed to fetch stories'>{error.message}</ErrorAlert>
    }

    return (
        <VStack w='100%' align='start' justify='start' spacing='4'>
            {stories && stories.map(story => <StoryItem key={story.id} story={story} />)}
        </VStack>
    )
}


interface StoryItemProps {
    story: IStory;
}
function StoryItem({ story }: StoryItemProps) {
    return (
        <Flex p='4' borderBottom='1px solid' borderBottomColor='gray.100' w='100%'
            direction={"column"} verticalAlign={'top'}>
            <Flex justify='space-between'><Link to={`/stories/${story.id}`}>
                [{story.language}] {story.title} created on {dayjs(story.created).format('M D')}
            </Link>
            <StyledIconButton ml='auto' aria-label='delete' hoverBg='red.100' icon={<DeleteIcon />} />
            </Flex>
            <Flex fontSize={'sm'}>
                <Text>{story.level} - {story.style} - {story.topic}</Text>
            </Flex>
        </Flex >
    )
}