
export function buildQueryString(query: any) {
    const parts = [];
    for (const key of Object.keys(query)) {
        const val = query[key];
        if (val != null) {
            parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(String(val)));
        }
    }
    return parts.join("&");
}

export function join(left: string, right: string) {
    if (left.endsWith('/')) {
        if (right.startsWith('/')) {
            return left + right.substring(1);
        } else {
            return left + right;
        }
    } else if (right.startsWith('/')) {
        return left + right;
    } else {
        return left + '/' + right;
    }
}
