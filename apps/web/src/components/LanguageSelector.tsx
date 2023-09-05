import { ChangeEvent } from "react";
import { Select } from "@chakra-ui/react";
import { useUserSession } from "../context/UserSession";
import { SupportedLanguages } from "../types";


interface SelectLanguageProps {
    value: string;
    onChange: (value: string) => void;
}


function getLanguageName(lang: string, userLanguage: string = 'en') {


    const languageNames = new Intl.DisplayNames([userLanguage], {
        type: 'language'
    });


    return languageNames.of(lang);
}
  

export default function SelectLanguage({ value, onChange }: SelectLanguageProps) {

    const { user } = useUserSession();

    const _onChange = (ev: ChangeEvent<HTMLSelectElement>) => {
        onChange(ev.target.value as string)
    }
    return (
        <Select value={value} onChange={_onChange}>
            { SupportedLanguages.map((lang) => {
                return <option key={value} value={lang}>{getLanguageName(lang, user?.language ?? 'en')}</option>
            })
            }
        </Select>
    )
}
