/**
 * typed-request 浏览器端实现
 * 使用 xhr 实现
 */
import { factory } from './index';
import { ResponseType, RequestBody, TRequestOptions, TRequestResponse } from './interface';
import { buildUrl, isObject } from './utils';
export * from './index';

function transformData<D extends any> (data: D, headers: {[x in string]: string}) {
    if (
        data instanceof FormData ||
        data instanceof ArrayBuffer ||
        //  data instanceof Buffer ||
        // data instanceof ReadableStream ||
        data instanceof Blob
    ) {
        delete headers['Content-Type']; // Let the browser set it
        return data;
    }
    if (data instanceof URLSearchParams) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        return data;
    }
    if (isObject(data) || headers['Content-Type']?.includes('application/json')) {
        headers['Content-Type'] = 'application/json;charset=utf-8';
        return JSON.stringify(data);
    }
    return data as BodyInit;
}

async function basic<
         T extends RequestBody = RequestBody,
         R extends TRequestResponse['data'] = TRequestResponse['data']
     > (
    options: TRequestOptions<T>
): Promise<TRequestResponse<R>> {
    return new Promise(function xhrRequest (resolve, reject) {
        type Options = Omit<TRequestOptions, 'init'> & { init: RequestInit }
        const { url, data, params, query, method, headers, init, responseType } = options as Options;

        const _url = buildUrl(url, query || {}, params || {});

        const _headers = {
            Accept: 'application/json, text/plain, */*',
            ...(['POST', 'PUT', 'PATCH'].includes(method)
                ? {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
                : {}),
            ...headers
        };
        const body = data ? transformData<T['data']>(data, _headers) : undefined;

        const xhr = new XMLHttpRequest();
        Object.entries(_headers).forEach(([k, v]) => {
            xhr.setRequestHeader(k, v);
        });
        xhr.open(method, _url, true);
        xhr.withCredentials = true;

        xhr.send(body);

        const resp: TRequestResponse<R> = {
            headers: respHeaders,
            data: respData,
            status: response.status,
            cookies: document?.cookie.split(';').map(each => each.trim())
        } as TRequestResponse<R>;
        return resp;
    });
}

// export typed-request 的实现
export default factory(basic, []);
