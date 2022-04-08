/* eslint-disable no-use-before-define */

/**
 * http method
 */
export type Method = 'GET' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH' | 'CONNECT' | 'TRACE'

/**
 * 可设定的返回类型
 */
export type ResponseType =
    | 'arraybuffer'
    | 'blob'
    | 'json'
    | 'text'
    | 'stream'

/**
 * 请求数据类型
 */
export type RequestData = string | Record<string, any> | ArrayBuffer
export type RequestBody = {
    params?: Record<string, number | string>;
    query?: Record<string, any>;
    data?: RequestData;
}

export type TRequestOptions<T extends RequestBody = RequestBody> = {
    url: string;
    /**
     * 设置请求的 header，header 中不能设置 Referer。
     * `content-type` 默认为 `application/json`
     */
    headers?: Record<string, string>;

    /** HTTP 请求方法 */
    method: Method;

    /**
     * responseType default json
     */
    responseType?: ResponseType;

    init?: Record<string | number | symbol, any>;

    middlewares?: TRequestMiddleware[];
} & T

export type TRequestResponse<Data extends any = any> = {
    cookies?: string[];

    data: Data;

    // 开发者服务器返回的 HTTP Response Header
    headers: Record<string, string>;

    // 服务器返回的 HTTP 状态码
    status: number;
}

export type TRequestError<T extends Record<string | number | symbol, any> = {}> = {
    error: Error
} & T

export type ToReturn<S, E> = [TRequestResponse<S>, null] | [null, TRequestError<E>]

/**
 * 中间件 处理请求参数及返回
 */
export type TRequestMiddleware =
    <T extends TRequestOptions, R extends TRequestResponse['data']>(
        options: T,
        next: (options: T) => Promise<TRequestResponse<R>>
    ) => Promise<TRequestResponse<R>>

export interface TRequestApi<
    T extends RequestBody = RequestBody,
    R extends TRequestResponse['data'] = TRequestResponse['data'],
    E extends Record<string | number | symbol, any> = {}
> {
    <NT extends T, NR extends R>(
        options: Partial<TRequestOptions<NT>> & NT
    ): Promise<TRequestResponse<NR>>;

    to<NT extends T, NR extends R, NE extends E>(
        options: Partial<TRequestOptions<NT>> & NT
    ): Promise<ToReturn<NR, NE>>;
}

export interface TRequest {
    /**
     * 请求函数
     */
    <
        T extends RequestBody = RequestBody,
        R extends TRequestResponse['data'] = TRequestResponse['data']
    >(
        options: TRequestOptions<T>
    ): Promise<TRequestResponse<R>>;

    /**
     * golang风格异常捕获
     * @param options
     */
    to<
        T extends RequestBody = RequestBody,
        R extends TRequestResponse['data'] = TRequestResponse['data'],
        E extends Record<string | number | symbol, any> = {}
    >(
        options: TRequestOptions<T>
    ): Promise<ToReturn<R, E>>;

    /**
     * 生成API
     * @param common 固定参数 (url method .etc)
     */
    api<
        T extends RequestBody = RequestBody,
        R extends TRequestResponse['data'] = TRequestResponse['data'],
        E extends Record<string | number | symbol, any> = {}
    >(
        common: Partial<TRequestOptions<T>>
    ): TRequestApi<T, R, E>;

    /**
     * 创建新的request
     * @param middleware 中间件
     */
    create(middleware: TRequestMiddleware): TRequest;
    create(middlewares: TRequestMiddleware[]): TRequest;
}

/**
 * 结合 factory 函数定义 typed-request 实现时的第一个参数定义
 * 不同实现只需要实现该函数即可
 */
export type TRequestBasic = <
    T extends RequestBody = RequestBody,
    R extends TRequestResponse['data'] = TRequestResponse['data']
>(options: TRequestOptions<T>) => Promise<TRequestResponse<R>>;

export type ApiDefinition<
    Options extends unknown,
    Result extends Promise<TRequestResponse>
> = (trq: TRequest, options: Options) => Result;
