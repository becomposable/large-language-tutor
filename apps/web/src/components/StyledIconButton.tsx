import { IconButton, IconButtonProps } from "@chakra-ui/react";


interface StyledIconButtonProps extends Omit<IconButtonProps, 'aria-label'> {
    "aria-label"?: string;
    hoverBg?: string;
}
export default function StyledIconButton({ hoverBg, ...props }: StyledIconButtonProps) {
    const label = props.title || props['aria-label'] || 'Button';

    return (
        <IconButton {...props} variant='ghost' rounded='full'
            title={label} aria-label={label}
            border='none'
            _focus={{
                border: 'none',
                outline: 'none'
            }}
            _active={{
                border: 'none',
                outline: 'none'
            }}
            _hover={{
                bg: hoverBg || 'gray.100',
                border: 'none',
            }}
        />
    )
}