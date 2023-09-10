import { Box, Button, Center, Flex, HStack, Heading, Input, Spacer, Spinner, Stack, Text, VStack } from "@chakra-ui/react";
import { QACheck, Question, QuestionAndAnswer } from "@language-tutor/types";
import { ErrorBoundary } from "@sentry/react";
import { useContext, useState } from "react";
import { MdLightbulbOutline } from "react-icons/md";
import ErrorAlert from "../../components/ErrorAlert";
import JpText from "../../components/JpText";
import StyledIconButton from "../../components/StyledIconButton";
import DefaultBlinkingCursor from "../../components/ellipsis-anim/DefaultBlinkingCursor";
import { useUserSession } from "../../context/UserSession";
import { useFetch } from "../../hooks/useFetch";
import { IStory, MessageStatus } from "../../types";
import { ExplainContext } from "../explain/ExplainContextProvider";


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
    const [qaCheck, setQaCheck] = useState<QACheck | undefined>(undefined);
    const [thinking, setThinking] = useState(false);

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
        setThinking(true);
        client.get(`/stories/${storyId}/questions`).then(res => {
            setQuestions(res.data as Question[]);
            setThinking(false);
        })
    }

    const verifyAnswers = (answers: QuestionAndAnswer[]) => {
        setThinking(true);
        console.log('###answers:', answers)
        const payload = { data: answers, type: "RequestPayload.VerifyAnswer" };
        client.post(`/stories/${storyId}/verify_answers`, { payload: payload }).then(checkedPayload => {
            console.log('###check:', checkedPayload)
            setQaCheck(checkedPayload.data as QACheck);
            setThinking(false);
        })
    }

    if (error) {
        return <ErrorAlert title={"Cannot fetch story"}>{error.message}</ErrorAlert>
    }

    if (!story) {
        return <Center pt='10'><Spinner /></Center>
    }

    return (

        <Stack w='100%' direction={"row"}>
            <Box w='60%'>
            <ErrorBoundary>
                <StoryZone story={story} streamedContent={streamedContent} />
            </ErrorBoundary>
            </Box>
            <Flex w='40%' direction={"column"}>
                <Heading pb={10} size='md' display='flex' alignItems='left'>
                    <Box>Questions & Answers</Box>
                </Heading>

                {thinking && <Center pt='10'><Spinner /></Center>}
                {(!thinking && questions.length > 0) && <QandAForm questions={questions} verifyAnswers={verifyAnswers} qaChecked={qaCheck} />}
                {((questions.length === 0) && !qaCheck) && 
                <Box textAlign={"center"}>
                    <Text >No questions to answers, clic on Fetch Questions after having read the text to start</Text>
                    <Button my={10} onClick={fetchQuestions} disabled={thinking}>Fetch Questions</Button>
                </Box>
                }
            </Flex>
        </Stack>
    )

}

function QandAForm({ questions, qaChecked, verifyAnswers }: { questions?: Question[], qaChecked?: QACheck, verifyAnswers: (answers: QuestionAndAnswer[]) => void }) {

    console.log('###qaChecked:', qaChecked)

    console.log('###questions:', questions)

    const test_data_questions = [
        {
            "question": "What is the capital of France?"
        },
        {
            "question": "What is the capital of Germany?"
        },
        {  "question": "What is the capital of Italy?"
        }
    ]

    const test_data_qaCheck: QACheck = {
        answers: [
            {
                "question": "What is the capital of France?",
                "answer": "Paris",
                "correct_answer": "Paris",
                "is_correct": true
            },
            {
                "question": "What is the capital of Germany?",
                "answer": "Berlin",
                "correct_answer": "Berlin",
                "is_correct": true
            },
            {
                "question": "What is the capital of Italy?",
                "answer": "Milan",
                "correct_answer": "Rome",
                "is_correct": false
            }
        ],
        "score": 2,
    }
    return (
            <Flex direction={"column"} width="100%">
                {qaChecked && <VerifiedQuestions qaCheck={qaChecked} />}
                {(!qaChecked && questions) && <QuestionsToAnswer questions={questions} verifyAnswer={verifyAnswers}/>}
                </Flex>
    )

}

function VerifiedQuestions({ qaCheck }: { qaCheck: QACheck }) {
    return (
        <Box>
            {qaCheck.answers.map((q, i) => {
                return (
                    <Box key={i}  pt={2}>
                        <Text>{i+1} — {q.question}</Text>
                        {q.is_correct && <Text color='green'>{q.correct_answer}</Text>}
                        {!q.is_correct &&
                            <Box>
                                <Text color='red' textDecorationLine={"line-through"}>{q.answer}</Text>
                                <Text color='green'>{q.correct_answer}</Text>
                            </Box>
                        }
                    </Box>
                )
            })}
        </Box>
    )
}


function QuestionsToAnswer({ questions, verifyAnswer }: { questions: Question[], verifyAnswer: (answers: QuestionAndAnswer[]) => void }) {

    //collect all answers, build a QuestionsAndAnswers object, and send it to the server
    const submit = () => {

        const answers: QuestionAndAnswer[] = [];
        questions.forEach((q, i) => {
            const answer = (document.getElementById(i.toString()) as HTMLInputElement).value;
            answers.push({ question: q.question, answer: answer });
        })

        //check that all questions have been answered
        if (answers.length !== questions.length) {
            return;
        }

        verifyAnswer(answers);
    }


    return (
        <Box>
            {questions.map((q, i) => {
                return (
                    <Box key={i} py='4'>
                        <Text>{i+1} — {q.question}</Text>
                        <Input id={i.toString()} py='2' placeholder="Answer" />
                        <Spacer />
                    </Box>
                )
            }
            )}
            <Button onClick={submit} >Submit</Button>
        </Box>
    )

}

function StoryZone({ story, streamedContent }: { story: IStory, streamedContent: IStreamedContent }) {

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
            <Flex direction={"column"} width="100%">
                <Heading size='md' display='flex' alignItems='left'>
                    <Box>{title}</Box>
                </Heading>
                <Box>
                <RenderTextToHtml text={content} language={language} />
                </Box>
            </Flex>
        </VStack >
    )
}

function RenderTextToHtml({ text, language }: { text: string, language: string }) {

    const doExplain = useContext(ExplainContext);

    return text.split('\n').map((line, i) => {
        if (line === '') return;
        return (
            <HStack key={i} justify="space-between" align="start">
                <Text border="" padding={2} key={i}>
                    {(language === 'JP' || language === 'JA') ? 
                    <JpText text={line} />
                    : line
                    }
                </Text>
                <StyledIconButton title='Explain' icon={<MdLightbulbOutline />} onClick={() => doExplain({content: line})} />
            </HStack>
        )
    })
}