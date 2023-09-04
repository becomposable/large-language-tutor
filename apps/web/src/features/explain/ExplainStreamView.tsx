import { useState, useEffect } from "react";
import DefaultBlinkingCursor from "../../components/ellipsis-anim/DefaultBlinkingCursor";
import { useUserSession } from "../../context/UserSession";
import { IExplanation } from "../../types";
import { IExplainContext } from "./ExplainContextProvider";
import { Box } from "@chakra-ui/react";



export function ExplainStreamView({ messageId, contentContext, contentToExplain }: IExplainContext) {
    const { client } = useUserSession();
    const [content, setContent] = useState('');
    const [explanation, setExplanation] = useState<IExplanation | null>(null);
    const [inProgress, setInProgress] = useState(false);

    useEffect(() => {
        const chunks: string[] = [];
        const payload = { content: contentToExplain, context: contentContext, messageId: messageId };
        console.log("Requesting explanaition for: " + payload);
        if (inProgress) {
            console.log("Already in progress, skipping")
            return;
        }

        client.post('/explain', { payload: payload })
            .then(res => {
                setExplanation(res.data);
                console.log("Received explanation: " + res);
                const sse = new EventSource(client.getUrl(`/explain/${res.id}/stream`));
                sse.addEventListener("open", () => {
                    setInProgress(true);
                });
                sse.addEventListener("message", ev => {
                    const data = JSON.parse(ev.data);
                    if (data) {
                        chunks.push(data);
                        setContent(chunks.join(''))
                    }
                });
                sse.addEventListener("close", (ev) => {
                    sse.close();
                    setInProgress(false);
                    const expl = JSON.parse(ev.data)
                    setExplanation(expl);
                });
            })
            .catch(err => {
                console.error(err);
            })
    }, [contentContext, messageId]);

    return (
        <Box w='100%' h='100%'>
            <Box whiteSpace='pre-line'>
                {explanation?.content || content}
                {!explanation && <DefaultBlinkingCursor />}
            </Box>
        </Box>
    )
}