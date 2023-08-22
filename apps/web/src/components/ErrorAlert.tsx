import { Alert, AlertDescription, AlertIcon, AlertProps, AlertTitle } from "@chakra-ui/react";
import { ReactNode } from "react";

interface ErrorAlertProps extends AlertProps {
    title: string;
    children: ReactNode | ReactNode[];
}
export default function ErrorAlert({ title, children, ...others }: ErrorAlertProps) {
    return (
        <Alert status='error' {...others}>
            <AlertIcon />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription whiteSpace='pre'>{children}</AlertDescription>
        </Alert>
    )
}
