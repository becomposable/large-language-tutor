import { Box } from "@chakra-ui/react";
import AppPage from "../layout/AppPage";
import { useUserSession } from "../context/UserSession";
import UserPrefModal from "../features/user/UserSettingsModal";

export default function DashboardPage() {
    const { user } = useUserSession();
    
    const onClose = () => {
        return;
    }

    return (
        <AppPage>
            <Box>Dashboard</Box>
            { (user && !user.language) && 
            <UserPrefModal isOpen={true} onClose={onClose} />
            }
        </AppPage>
    )
}