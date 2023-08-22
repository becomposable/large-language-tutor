import TutorChat from "../chat/TutorChat";

interface ConversationViewProps {
    conversationId: string;
}
export default function ConversationView({ conversationId }: ConversationViewProps) {

    return <TutorChat conversationId={conversationId} />

}