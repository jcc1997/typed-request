/**
 * typed-request 浏览器端实现
 * 使用 fetch
 */
import { factory } from './index';
import { ResponseType, RequestBody, TRequestOptions, TRequestResponse } from './interface';
import { buildUrl, isObject } from './utils';
export * from './index';

function transformData<D extends any> (data: D, headers: Headers) {
    if (
        data instanceof FormData ||
         data instanceof ArrayBuffer ||
         data instanceof Buffer ||
         data instanceof Blob ||
         data instanceof ReadableStream
    ) {
        return data;
    }
    if (data instanceof URLSearchParams) {
        headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
        return data;
    }
    if (isObject(data) || headers.get('Content-Type')?.includes('application/json')) {
        headers.set('Content-Type', 'application/json;charset=utf-8');
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
     type Options = Omit<TRequestOptions, 'init'> & { init: RequestInit }
     const { url, data, params, query, method, headers, init, responseType } = options as Options;

     const _url = buildUrl(url, query || {}, params || {});

     const _headers = new Headers({
         Accept: 'application/json, text/plain, */*',
         ...(['POST', 'PUT', 'PATCH'].includes(method)
             ? {
                 'Content-Type': 'application/x-www-form-urlencoded'
             }
             : {}),
         ...headers
     });
     const body = data ? transformData<T['data']>(data, _headers) : undefined;

     const request = new Request(_url, {
         credentials: 'same-origin', // include, same-origin, *omit
         method, // *GET, POST, PUT, DELETE, etc.
         mode: 'same-origin', // no-cors, cors, *same-origin
         headers: _headers,
         body,
         ...init
     });

     const response = await fetch(request);

     // get headers
     const respHeaders: Record<string, string> = {};
     Array.from(response.headers.entries()).forEach((cur) => {
         respHeaders[cur[0]] = cur[1];
     });

     // transform responseType
     let _responseType: ResponseType;
     if (responseType) {
         _responseType = responseType;
     } else {
         _responseType = 'stream';
         const contentType = response.headers.get('Content-Type');
         if (contentType?.includes('application/json')) {
             _responseType = 'json';
         } else if (contentType?.includes('text')) {
             _responseType = 'text';
         }
     }

     // get data
     let respData: R;
     switch (_responseType) {
     case 'json':
         respData = await response.json() as R; break;
     case 'text':
         respData = await response.text() as R; break;
     case 'arraybuffer':
         respData = await response.arrayBuffer() as R; break;
     case 'blob':
         respData = await response.blob() as R; break;
     case 'stream':
     default:
         respData = (response.body || response) as R;
     }

     const resp: TRequestResponse<R> = {
         headers: respHeaders,
         data: respData,
         status: response.status,
         cookies: document?.cookie.split(';').map(each => each.trim())
     } as TRequestResponse<R>;
     return resp;
}

// export typed-request 的实现
export default factory(basic, []);
