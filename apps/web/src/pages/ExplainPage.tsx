import { useParams } from "react-router";
import ExplainView from "../features/explain/ExplainView";
import AppPage from "../layout/AppPage";

export default function StoriesPage() {
    const { explainId } = useParams();
    return (
        <AppPage>
            <ExplainView  explainId={explainId} />
        </AppPage>
    )
}