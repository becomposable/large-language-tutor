import { useParams } from "react-router";
import StoryView from "../features/stories/StoryView";
import AppPage from "../layout/AppPage";

export default function StoryPage() {
    const { storyId } = useParams();

    return storyId && (
        <AppPage>
            <StoryView storyId={storyId} />
        </AppPage>
    )
}