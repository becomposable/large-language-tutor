import { useEffect, useState } from "react";

export interface IFetchOpts<T> {
    start?: () => void,
    end?: () => void,
    defaultValue?: T | (() => T),
    deps?: any[] | undefined,
    condition?: () => boolean,
    onSuccess?: (data: T) => void,
    onError?: (err: any) => void,
}

export function useFetch<T = any>(fetcher: () => Promise<T>, opts?: IFetchOpts<T> | any[] | undefined | null) {
    if (Array.isArray(opts)) {
        opts = { deps: opts };
    }
    const options = (opts || {}) as IFetchOpts<T>;
    const [error, setError] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<T | undefined>(options.defaultValue);
    const fetch = () => {
        options.start && options.start();
        setIsLoading(true);
        fetcher().then((result: T) => {
            setData(result);
            options.onSuccess && options.onSuccess(result);
        }).catch(error => {
            setError(error);
            options.onError && options.onError(error);
        }).finally(() => {
            setIsLoading(false);
            options.end && options.end();
        });
    }
    useEffect(() => {
        if (!options.condition || options.condition()) {
            fetch();
        }

    }, options.deps);
    return { data, isLoading, error, setData, refetch: fetch };
}

export default function useFetchOnce<T>(fetcher: () => Promise<T>, opts?: IFetchOpts<T> | any[] | undefined | null) {
    if (!opts || Array.isArray(opts)) {
        opts = { deps: [] };
    } else if (opts) {
        opts.deps = [];
    }
    return useFetch<T>(fetcher, opts);
}
