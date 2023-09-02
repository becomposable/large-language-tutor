import { Box, Center, Flex, Heading, Spinner, Text, VStack } from "@chakra-ui/react";
import ErrorAlert from "../../components/ErrorAlert";
import { useUserSession } from "../../context/UserSession";
import { useFetch } from "../../hooks/useFetch";
import { IStory, MessageStatus } from "../../types";
import JpText from "../../components/JpText";
import { useState } from "react";
import DefaultBlinkingCursor from "../../components/ellipsis-anim/DefaultBlinkingCursor";
import { QACheck, Question, QuestionAndAnswer } from "@language-tutor/types";


interface IStreamedContent {
    title: string;
    content: string;
}

function parseStoryResult(result: string): IStreamedContent {
    const eol = result.indexOf('\n');
    if (eol < 0) {
        return { title: result, content: '' }
    } else {
        return { title: result.substring(0, eol).trim(), content: result.substring(eol + 1) }
    }
}

function streamStory(url: string,
    setStreamedContent: (content: IStreamedContent) => void,
    setStory: (story: IStory) => void) {

    const chunks: string[] = [];
    const sse = new EventSource(url);
    sse.addEventListener("message", ev => {
        const data = JSON.parse(ev.data);
        if (data) {
            chunks.push(data);
            const result = chunks.join('');
            setStreamedContent(parseStoryResult(result));
        }
    });
    sse.addEventListener("close", (ev) => {
        sse.close();
        const story = JSON.parse(ev.data)
        setStory(story);
    });
}


interface StoryViewProps {
    storyId: string;
}
export default function StoryView({ storyId }: StoryViewProps) {
    const { client } = useUserSession();
    const [streamedContent, setStreamedContent] = useState<IStreamedContent>({ title: '', content: '' });
    const [questions, setQuestions] = useState<Question[]>([]);
    const [qaCheck, setQaCheck] = useState<QACheck|undefined>(undefined);

    const { data: story, error, setData } = useFetch<IStory>(() => {
        return client.get(`/stories/${storyId}`).then(story => {
            if (story.status === MessageStatus.created) {
                // we must start streaming the story
                streamStory(client.getUrl(`/stories/${storyId}/stream`), setStreamedContent, setData);
            }
            return story;
        })
    }, {
        deps: [storyId]
    });


    const fetchQuestions = () => {
        client.get(`/stories/${storyId}/questions`).then(questions => {
            setQuestions(questions);
        })
    }

    const verifyAnswer = (answers: QuestionAndAnswer[]) => {
        client.post(`/stories/${storyId}/verify_answers`, {payload: answers}).then(check => {
            setQaCheck(check);
        })
    }


    if (error) {
        return <ErrorAlert title={"Cannot fetch story"}>{error.message}</ErrorAlert>
    }

    if (!story) {
        return <Center pt='10'><Spinner /></Center>
    }

    switch (story.status) {
        case MessageStatus.created:
            return (
                <StreamedStoryContent title={streamedContent.title}
                    content={streamedContent.content}
                    language={story.language} />
            )
        case MessageStatus.pending:
            return <Center pt='10'><Spinner /></Center>
        default: return (
            <StoryContent title={story.title || ''}
                content={story.content || ''}
                language={story.language} />
        )
    }

}

function StreamedStoryContent({ title, content, language }: StoryContentProps) {
    console.log('###title:', title);
    return (
        <VStack w='100%' px='4' align='start' justify='start'>
            <Flex justify='space-between' align='start' w='100%' >
                <Heading size='md' display='flex' alignItems='left'>
                    <Box>{title} {!content && <DefaultBlinkingCursor />}</Box>
                </Heading>
                <Box>Language: <b>{language}</b></Box>
            </Flex>
            <Flex>
                <Box whiteSpace='pre-line'>{content} {content && <DefaultBlinkingCursor />}</Box>
            </Flex>
        </VStack >
    )
}


interface StoryContentProps {
    title: string;
    content: string;
    language: string;
}
function StoryContent({ title, content, language }: StoryContentProps) {
    return (
        <VStack w='100%' px='4' align='start' justify='start'>
            <Flex width="70%">
                <Heading size='md' display='flex' alignItems='left'>
                    <Box>{title}</Box>
                </Heading>
                <Box>{renderTextToHtml(content, language)}</Box>
            </Flex>
        </VStack >
    )
}

function renderTextToHtml(text: string, language: string) {
    return text.split('\n').map((line, i) => {
        return (
            (language === 'JP' || language === 'JA') ?
                <Text padding={1} key={i}><JpText text={line} /></Text>
                : <Text padding={1} key={i}>{line}</Text>
        )
    })
}