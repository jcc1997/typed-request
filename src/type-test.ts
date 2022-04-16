/**
 * 用于测试typescript
 */
import {
  ResponseType,
  TRequest,
  TRequestApi,
  TRequestMiddleware,
  TRequestOptions,
  TRequestResponse,
} from "./interface";
import { defineApi, defineApis } from "./index";

/**
 * typed-request 的空实现
 */
const request: TRequest = async function <
  T extends TRequestOptions = TRequestOptions,
  R extends TRequestResponse["data"] = TRequestResponse["data"]
>(options: T): Promise<TRequestResponse<R>> {
  throw new Error();
};

request.api = function <
  T extends Partial<TRequestOptions> = TRequestOptions,
  R extends TRequestResponse["data"] = TRequestResponse["data"]
>(common: Partial<TRequestOptions>): TRequestApi<T, R> {
  throw new Error();
};

request.fork = function (
  middlewares: TRequestMiddleware | TRequestMiddleware[]
): TRequest {
  throw new Error();
};

request({
  url: "/test",
  method: "GET",
});

request<
  {
    params: {
      a: string;
    };
  },
  string
>({
  url: "/test",
  method: "GET",
  params: {
    a: "123", // must be string
  },
}).then((resp) => {
  const a = resp.data; // a: string
});

{
  const api = request.api<
    {
      params: {
        a: string;
      };
    },
    string
  >({
    method: "GET",
    url: "/test/user",
  });

  api({
    params: {
      a: "1",
    },
  }).then((resp) => {
    const a = resp.data; // string
  });
}

const apiDefs = defineApis({
  async getData(trq, options: { id: string }) {
    const { id } = options;
    // TRequestOptions 第一个范型参数其实无用
    // 但是要定义第二个范型就不能省略第一个
    const resp = await trq<TRequestOptions, { id: string }[]>({
      url: "/api/:id",
      method: "GET",
      params: {
        id,
      },
    });
    return resp;
  },
});

{
  const apis = apiDefs(request);
  apis.getData({
    id: "123",
  });
}

const apiDef = defineApi(async (trq, options: { id: string }) => {
  const { id } = options;
  // TRequestOptions 第一个范型参数其实无用
  // 但是要定义第二个范型就不能省略第一个
  const resp = await trq<TRequestOptions, { id: string }[]>({
    url: "/api/:id",
    method: "GET",
    params: {
      id,
    },
  });
  return resp;
});

{
  const getData = apiDef(request);
  getData({
    id: "123",
  });
}

const newRequest = request.fork((options, next) => {
  return next(options);
});
