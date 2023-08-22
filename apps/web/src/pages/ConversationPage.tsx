import { useParams } from "react-router";
import AppPage from "../layout/AppPage";
import ConversationView from "../features/conversations/ConversationView";


export default function ConversationPage() {
    const { conversationId } = useParams();
    return (
        <AppPage>
            <ConversationView conversationId={conversationId!} />
        </AppPage>
    )
}