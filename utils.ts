export function replacePathVariables (
    url: string,
    variables: Record<string, number | string>
): string {
    const regex = /\/:([A-Za-z_0-9]+)/;

    let newUrl = url;
    let tmpArr = regex.exec(newUrl);
    while (tmpArr !== null) {
        const key = tmpArr[1];
        if (variables[key] !== undefined && variables[key] !== null) {
            newUrl = newUrl.replace(`:${key}`, variables[key].toString());
        } else {
            throw new Error(`require path variable ${key}`);
        }
        tmpArr = regex.exec(newUrl);
    }

    return newUrl;
}

export function appendParams (
    url: string,
    params: Record<string, number | string>
): string {
    const query = Object.entries(params).map(([k, v]) => {
        if (v === '' || v === undefined || v === null) return undefined;
        return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
    }).filter(v => !!v).join('&');
    return query ? url.includes('?') ? url + query : url + '?' + query : url;
}

export function buildUrl (
    url: string,
    query: Record<string, number | string>,
    variables: Record<string, number | string>
): string {
    return appendParams(replacePathVariables(url, variables), query);
}

export function isObject (val: unknown): val is Object {
    return val !== null && typeof val === 'object';
}
