import { useEffect } from "react";

export default function useOnWindowLoad(listener: (this: Window, ev: Event) => any) {
    useEffect(() => {
        const callback = listener;
        window.addEventListener("load", callback);
        return () => {
            window.removeEventListener("load", callback);
        }
    }, []);
}