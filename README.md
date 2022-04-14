# typed-request

赋予类型提示能力及使用中间件的请求工具约定。基于该约定，可以自定义实现请求工具并使用本约定提供的其他能力（类型提示，API定义）。

## 使用

### `TRequest`

一个基本的 `typed-request` 实现应具备 `TRequest` 中的能力。

`typed-request` 本身应该是一个具备请求能力的函数。

```typescript
trq({
    url: '/test',
    method: 'GET'
})
```

我们可以通过定义第一个范型参数（代表入参数据类型限制）和第二个范型参数的方式传入（代表出参类型）来使返回获得类型提示

```typescript
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
```

`typed-request` 应具备属性 `api` 为 api 定义函数。

使用 `api`:

```typescript
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
```

> 参考 [类型测试](./tests/type-test.ts)

`typed-request` 应具备属性 `create`, 用于扩展实例，定义中间件。

`create` 入参是中间件数组，使用 `create` 后返回的是一个新的 `typed-request` 实例，会继承原有 `typed-request` 实例的所有中间件。
### API 定义

在约定了 `typed-request` 的接口后，我们可以支持先定义 API，后置载入 `typed-request` 实现的方式进行 API 定义的复用。

```typescript
// definitions.ts
export const apiDefs = defineApis({
    async getData (trq, options: { id: string }) => {
        const { id } = options;
        // TRequestOptions 第一个范型参数其实无用
        // 但是要定义第二个范型就不能省略第一个
        const resp = await trq<TRequestOptions, { id: string }[]>({
            url: '/api/:id',
            method: 'GET',
            params: {
                id
            }
        });
        return resp;
    })
});
```

```typescript
// implements.ts
import trq from '@cj97/typed-request/dist/browser'; // typed-request 预置的浏览器实现
// or:
// import trq from '@cj97/typed-request/browser';

// 只需要简单将 typed-request 实现注入
// const apis: {
//     getData: (options: {
//         id: string;
//     }) => Promise<TRequestResponse<{
//         id: string;
//     }[]>>;
// }
export const apis = apiDefs(trq);
```

```typescript
// usage.ts

// resp: TRequestResponse<{
//     id: string;
// }[]>
const resp = await apis.getData({
    id: '1'
});
```


### 定义 `typed-request` 实现

使用提供的 `factory` 函数，只需要定义符合 `TRequestBasic` 类型的基础请求函数即可。

参考 [默认browser实现](./browser.ts)

### 定义中间件

非强制性约束，中间件的执行是根据不同情况下对中间件传入的顺序来决定执行的顺序。后传入的在里层。

比如对状态码 `>= 400` 的情况，需要报错。

通过 `create` 全局定义中间件。

```typescript
import { TRequestMiddleware } from '@cj97/typed-request';
import trq from '@cj97/typed-request/dist/browser';

/**
 * 错误状态码处理中间件
 */
const errorMid: TRequestMiddleware = async function(options, next) {
    const resp = await next(options);
    if (resp.status >= 400) {
        throw {
            error: new Error(`Request ${resp.status}`),
            resp
        };
    }
    return resp;
};

// 通过 create 函数及中间件扩展出新的 typed-request 实现
export const myTrq = trq.create([
    errorMid
]);
```

或者，定义仅对单个 api 的中间件。

```typescript
import trq from '@cj97/typed-request/dist/browser';

/**
 * 错误状态码处理中间件
 */
const errorMid: TRequestMiddleware = async function(options, next) {
    const resp = await next(options);
    if (resp.status >= 400) {
        throw {
            error: new Error(`Request ${resp.status}`),
            resp
        };
    }
    return resp;
};

trq({
    url: '/api/:id',
    method: 'GET',
    middlewares: [ errorMid ]
});
```
