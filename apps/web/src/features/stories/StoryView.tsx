import { Box, Flex, HStack, Heading, Text, VStack } from "@chakra-ui/react";
import { useUserSession } from "../../context/UserSession";
import { useFetch } from "../../hooks/useFetch";
import { IStory } from "../../types";
import ErrorAlert from "../../components/ErrorAlert";


interface StoryViewProps {
    storyId: string;
}
export default function StoryView({ storyId }: StoryViewProps) {
    const { client } = useUserSession();
    const { data: story, error } = useFetch<IStory>(() => {
        return client.get(`/stories/${storyId}`)
    }, {
        deps: [storyId]
    });

    if (error) {
        return <ErrorAlert title={"Cannot fetch story"}>{error.message}</ErrorAlert>
    }

    return story && (
        <VStack w='100%' px='4' >
            <Flex justify='space-between' align='left' w='100%' >
                <Heading size='md' display='flex' alignItems='left'>
                    <Box>{story.title}</Box>
                </Heading>
                <Box>Language: <b>{story.language}</b></Box>
            </Flex>
            <Flex>
                <Box>{renderTextToHtml(story.content)}</Box>
            </Flex>
        </VStack >
    )

}

function renderTextToHtml(text: string) {
    return text.split('\n').map((line, i) => <Text padding={1} key={i}>{line}</Text>)
}