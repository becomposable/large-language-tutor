import { KeyboardEvent, useRef } from "react";
import { API_BASE_URL } from "../../env";
import FetchClient from "../../fetch-client";
import { Box, FormControl, Input } from "@chakra-ui/react";

interface TutorChatProps {

}
export default function TutorChat({ }: TutorChatProps) {
    const outputRef = useRef<HTMLDivElement>(null);
    const onAsk = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {

            const prompt = e.currentTarget.value.trim();
            console.log('Ask>>>', prompt);
            e.currentTarget.value = '';
            new FetchClient(API_BASE_URL).post('/prompt', {
                payload: { message: prompt }
            }).then(r => {
                console.log('Answer>>>', r.answer);
                outputRef.current?.append(r.answer + '\n');
            });
        }
    }

    //TODO meed to implement a session on server side in order to use this
    // useEffect(() => {
    //     console.log("TutorChat mounted");
    //     const sse = new EventSource(`${API_BASE_URL}/prompt`);
    //     sse.addEventListener("message", ({ data }) => {
    //         console.log('SSE>>>', data);
    //     });
    //     return () => {
    //         console.log("TutorChat unmounted");
    //         sse.close();
    //     }
    // }, []);

    return (
        <Box>
            <Box></Box>
            <FormControl>
                <Input placeholder="Type a question" />
            </FormControl>
            <TextField.Input onKeyUp={onAsk} placeholder="Type a question" />
        </Box>
    )
}