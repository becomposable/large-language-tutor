import { useColorModeValue } from "@chakra-ui/react";


const APP_BG_LIGHT_COLOR = 'white'
//const APP_BG_DARK_COLOR = 'gray.900'
const APP_BG_DARK_COLOR = 'white'

const APP_BORDER_LIGHT_COLOR = 'gray.200'
//const APP_BORDER_DARK_COLOR = 'gray.700'
const APP_BORDER_DARK_COLOR = 'gray.200'

export function useAppBgColorModeValue() {
    return useColorModeValue(APP_BG_LIGHT_COLOR, APP_BG_DARK_COLOR);
}

export function useAppBorderColorModeValue() {
    return useColorModeValue(APP_BORDER_LIGHT_COLOR, APP_BORDER_DARK_COLOR);
}