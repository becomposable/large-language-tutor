import { Box, Button, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger, Portal, useDisclosure } from '@chakra-ui/react';
import { useState } from 'react';
import { usePopper } from 'react-popper';

interface DomPopoverProps {
    target: HTMLElement;
    disclosure: { isOpen: boolean, onOpen: () => void, onClose: () => void };
}
export default function DomPopover({ target, disclosure }: DomPopoverProps) {

    const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
    const [arrowElement, setArrowElement] = useState<HTMLElement | null>(null);
    const { styles, attributes } = usePopper(target, popperElement, {
        modifiers: [{ name: 'arrow', options: { element: arrowElement } }],
    });
    console.log("??????????????Popover", styles, attributes);

    return (
        <Popover isOpen={disclosure.isOpen} onClose={disclosure.onClose}>
            <Portal>
                <PopoverContent ref={setPopperElement} style={styles.popper} {...attributes.popper}>
                    <Box ref={setArrowElement} style={styles.arrow}><PopoverArrow /></Box>
                    <PopoverHeader>Header</PopoverHeader>
                    <PopoverCloseButton />
                    <PopoverBody>
                        {target.toString()}
                        <Button colorScheme='blue'>Button</Button>
                    </PopoverBody>
                    <PopoverFooter>This is the footer</PopoverFooter>
                </PopoverContent>
            </Portal>
        </Popover>
    )
};
