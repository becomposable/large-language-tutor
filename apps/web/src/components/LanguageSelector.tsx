import { ChangeEvent } from "react";
import { Select } from "@chakra-ui/react";
import { useUserSession } from "../context/UserSession";
import { SupportedLanguages } from "../types";


interface SelectLanguageProps {
    value?: string;
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
    const languageOptions = SupportedLanguages.map((lang) => {
        return { value: lang, label: getLanguageName(lang, user?.language ?? 'en') }
    }).sort((a, b) => (a.label && b.label) ? a.label.localeCompare(b.label) : 0);

    const _onChange = (ev: ChangeEvent<HTMLSelectElement>) => {      
        onChange(ev.target.value as string)
    }
    return (
        <Select defaultValue={value} onChange={_onChange}>
            <option value={undefined}>Select a language</option>
            {languageOptions.map((lang) => {
                return <option key={lang.value} value={lang.value}>{lang.label}</option>
            })
            }
        </Select>
    )
}
