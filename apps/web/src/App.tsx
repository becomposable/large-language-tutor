import { ChakraProvider } from '@chakra-ui/react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './App.css'
import { UserSessionProvider } from './context/UserSession'
import ConversationPage from './pages/ConversationPage'
import DashboardPage from './pages/DashboardPage'
import ConversationsPage from './pages/ConversationsPage'


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
