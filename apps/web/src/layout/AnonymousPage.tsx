import { Box, Center } from "@chakra-ui/react";
import { useUserSession } from "../context/UserSession";


interface AnonymousPageProps {
}
export default function AnonymousPage({ }: AnonymousPageProps) {
    return (
        <Center mt='20'><Box>Please login first</Box></Center>
    )
}