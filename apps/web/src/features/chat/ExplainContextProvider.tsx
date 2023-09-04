import { createContext, useState } from "react";
import ExplainModal from "./ExplainModal";

export interface IExplainContext {
    contentToExplain?: string,
    contentContext?: string,
    messageId?: string,
}

type DoExplainFunc = (args: IExplainContext) => void;

export const ExplainContext = createContext<DoExplainFunc>(() => {});

export function ExplainContextProvider({ children }: React.PropsWithChildren) {

    const [ state, setState ] = useState<IExplainContext|undefined>(undefined);

    function doExplain(explainContext: IExplainContext) {
        setState(explainContext);
    }

    function onClose() {
        setState(undefined);
    }

    return (
        <ExplainContext.Provider value={doExplain}>
            {children}
            { state && <ExplainModal onClose={onClose} context={state}/> }
        </ExplainContext.Provider>
    )
}