/**
 * 用于测试类型提示
 */
import { ResponseType, TRequest, TRequestApi, TRequestError, TRequestMiddleware, TRequestOptions, TRequestResponse } from '../interface';

/**
 * typed-request 的空实现
 */
const request: TRequest = async function <
    T extends TRequestOptions = TRequestOptions,
    R extends TRequestResponse['data'] = TRequestResponse['data']
> (
    options: T
): Promise<TRequestResponse<R>> {
    throw new Error();
};

const to: TRequest['to'] = async function <
    T extends TRequestOptions = TRequestOptions,
    R extends TRequestResponse['data'] = TRequestResponse['data'],
    E extends Record<string | number | symbol, any> = {}
> (
    options: T
) {
    throw new Error();
};
request.to = to;

request.api = function <
    T extends Partial<TRequestOptions> = TRequestOptions,
    R extends TRequestResponse['data'] = TRequestResponse['data'],
    E extends Record<string | number | symbol, any> = {}
> (
    common: Partial<TRequestOptions>
): TRequestApi<T, R, E> {
    throw new Error();
};

request.create = function (
    middlewares: TRequestMiddleware | TRequestMiddleware[]
): TRequest {
    throw new Error();
};

request({
    url: '/test',
    method: 'GET'
});

request<{
    params: {
        a: string
    }
}, string>({
    url: '/test',
    method: 'GET',
    params: {
        a: '123' // must be string
    }
}).then((resp) => {
    const a = resp.data; // a: string
});

const api = request.api<{
    params: {
        a: string
    }
}, string, {
    error: Error,
    errMsg: string
}>({
    method: 'GET',
    url: '/test/user'
});

api({
    params: {
        a: '1'
    }
}).then(resp => {
    const a = resp.data; // string
});

api.to({
    params: {
        a: '1'
    }
}).then(([resp, err]) => {
    if (resp) {
        const a = resp.data;
    } else if (err) {
        const msg = err.errMsg;
    }
});
