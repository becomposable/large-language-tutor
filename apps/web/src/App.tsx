import { ChakraProvider } from '@chakra-ui/react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './App.css'
import { UserSessionProvider } from './context/UserSession'
import ConversationPage from './pages/ConversationPage'
import ConversationsPage from './pages/ConversationsPage'
import DashboardPage from './pages/DashboardPage'
import StoriesPage from './pages/StoriesPage'
import StoryPage from './pages/StoryPage'


const router = createBrowserRouter([
    {
        path: '/',
        Component: DashboardPage,
    },
    {
        path: '/conversations/:conversationId',
        Component: ConversationPage,
    },
    {
        path: '/conversations',
        Component: ConversationsPage,
    },
    {
        path: '/stories',
        Component: StoriesPage,
    },
    {
        path: '/stories/:storyId',
        Component: StoryPage,
    }
]);

function App() {

    return (
        <UserSessionProvider>
            <ChakraProvider>
                <RouterProvider router={router} />∏
            </ChakraProvider>
        </UserSessionProvider>
    )

}

export default App
