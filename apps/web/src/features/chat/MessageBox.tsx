import { Box, BoxProps } from "@chakra-ui/react";

interface MessageBoxProps extends BoxProps {
}
export default function MessageBox({ children, ...props }: MessageBoxProps) {
    return (
        <Box {...props} position='relative' my='2' px='2' py='2' border='1px solid' borderColor='gray.100'
            _hover={{
                borderColor: 'gray.400'
            }}>
            {children}
        </Box>
    )
}

