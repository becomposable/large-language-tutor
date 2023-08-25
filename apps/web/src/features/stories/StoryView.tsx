import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import ErrorAlert from "../../components/ErrorAlert";
import { useUserSession } from "../../context/UserSession";
import { useFetch } from "../../hooks/useFetch";
import { IStory } from "../../types";
import JpText from "../../components/JpText";


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
                <Box>{renderTextToHtml(story.content, story.language)}</Box>
            </Flex>
        </VStack >
    )

}

function renderTextToHtml(text: string, language: string) {
    return text.split('\n').map((line, i) => {
    return (
        (language === 'JP' || language === 'JA') ?
            <Text padding={1} key={i}><JpText text={line} /></Text>
        :   <Text padding={1} key={i}>{line}</Text>
    )
})
}