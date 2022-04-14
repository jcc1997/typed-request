import {
  RequestBody,
  TRequest,
  TRequestApi,
  TRequestMiddleware,
  TRequestOptions,
  TRequestResponse,
  TRequestBasic,
  ApiDefinition,
} from "./interface";
export * from "./interface";

/**
 * factory 用于生成 typed-request 实例
 * @param basic 基础请求函数
 * @param middles 预置中间件
 * @returns typed-request 实例
 */
export function factory(
  basic: TRequestBasic,
  middles: TRequestMiddleware[]
): TRequest {
  const request: TRequest = async function <
    T extends RequestBody = RequestBody,
    R extends TRequestResponse["data"] = TRequestResponse["data"]
  >(options: TRequestOptions<T>): Promise<TRequestResponse<R>> {
    const { middlewares } = options;
    // 全局中间件在外层 自定义中间件在内层
    const concatMids = (middles ?? []).concat(middlewares ?? []);
    function dispatch(
      i: number
    ): (options: TRequestOptions<T>) => Promise<TRequestResponse<R>> {
      const mid = concatMids[i];

      if (i === concatMids.length) {
        return (options) => basic(options);
      } else {
        return (options) => mid(options, dispatch(i + 1));
      }
    }
    const resp = await dispatch(0)(options);
    return resp as TRequestResponse<R>;
  };

  request.api = function <
    T extends RequestBody = RequestBody,
    R extends TRequestResponse["data"] = TRequestResponse["data"],
    E extends Record<string | number | symbol, any> = {}
  >(common: Partial<TRequestOptions<T>>): TRequestApi<T, R> {
    const api: TRequestApi<T, R> = async function <
      NT extends T,
      NR extends R
    >(options: Partial<TRequestOptions<NT>>) {
      const data = await request<NT, NR>({
        ...common,
        ...options,
      } as TRequestOptions<NT>);
      return data;
    };
    return api;
  };

  request.create = function (
    middlewares: TRequestMiddleware | TRequestMiddleware[]
  ): TRequest {
    return factory(basic, [...middles].concat(middlewares));
  };

  return request;
}

/**
 * 用于在未定 typed-request instance 的时候定义 api
 * @param definition 一个<string, defineApi()> 的 map
 * @returns 返回一个科里化 definition 的函数
 */
export function defineApi<
  Options extends unknown,
  Result extends Promise<TRequestResponse>
>(
  definition: ApiDefinition<Options, Result>
): (trq: TRequest) => (options: Options) => Result {
  return (trq) => (options) => definition(trq, options);
}

/**
 * 用于在未定 typed-request instance 的时候定义 api 集合
 * @param apis 一个<string, ApiDefinition> 的 map
 * @returns 返回一个待传入 typed-request 实现的函数
 */
type DefaultApiDefinition<
  Options extends unknown = any,
  Result extends Promise<TRequestResponse> = Promise<TRequestResponse>
> = ApiDefinition<Options, Result>;
export function defineApis<T extends Record<string, DefaultApiDefinition>>(
  apis: T
): (trq: TRequest) => {
  [K in keyof T]: (options: Parameters<T[K]>[1]) => ReturnType<T[K]>;
} {
  return (trq) => {
    const result: {
      [x in string]: (options: unknown) => Promise<TRequestResponse>;
    } = {};
    Object.keys(apis).forEach((k) => {
      result[k] = defineApi(apis[k])(trq);
    });
    return result as {
      [K in keyof T]: (options: Parameters<T[K]>[1]) => ReturnType<T[K]>;
    };
  };
}
