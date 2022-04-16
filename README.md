# typed-request

## propose

typed-request (`TRequest`) is a set of interfaces, designed to unite the way to request server API by giving definition before implement.

Definitely typescript.

## examples

all usage can be found in [type-test](./src/type-test.ts)

## `typed-request` should be

a `typed-request` should implement `TRequest`。

`typed-request` itself should can make request.

```typescript
trq({
    url: '/test',
    method: 'GET'
})
```

give the first type params to define request params/data type.

give the second type params to define response type.

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

`typed-request` should have `api` method. So it can preset some of the request params.

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

`typed-request` should have `fork` method. So it can fork itself and add middlewares.

```typescript
// newRequest is also a typed-request
const newRequest = request.fork([
    async (options, next) => {
    // you can do something to options
    const response = await next(options);
    // you can do something to response
    return response;
    },
    // example: error code middleware
    async function(options, next) {
        const response = await next(options);
        if (response.status >= 400) {
            throw {
                error: new Error(`Request ${response.status}`),
                response
            };
        }
        return response;
    }
]);
```

### default implements

default implements has given in `/implements`.

you can import them by

```typescript
// use XMLHttpRequest for browser
import xhrRequest from 'typed-request/xhr';
// use fetch for browser
import fetchRequest from 'typed-request/fetch';
// use http for node
import httpRequest from 'typed-request/http';
```

### define your own implement

give function satisfy interface `TRequestBasic` to `factory` will generate a new `typed-request`

```typescript
/**
 * typed-request 的 fetch 实现
 */
import { factory } from "typed-request";
const yourRequest = factory(async function (options) {
    ...
    return response;
}, []);
```

## define the apis and get definition

Define the api first and implement them while you need them.

### why?

In real project, sometime we need to call the same api in different environment, like browser and node. And also we will need to do the same thing to the response.

One way to reduce the repetition is create a set of packages, using request tool like axios to pack them up. (axios can be use both in node and browser)

But in some Like in mini-program in wechat, you can't use axios, which you had pack it into your code.

Another way is to just pack up the logic and do not relate it to a specified requesting tool like axios.

### usage

```typescript
import { defineApis, defineApi } from 'typed-request';

// definitions.ts
export const apiDefs = defineApis({
    async getData (trq, options: { id: string }) => {
        // trq is the request you wanted
        const { id } = options;
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

// also you can define a single api
export const oneApiDef = defineApi(function (trq, options: { id: string }) {
    const { id } = options;
    const resp = await trq<TRequestOptions, { id: string }[]>({
        url: '/api/:id',
        method: 'GET',
        params: {
            id
        }
    });
    return resp;
}));
```

```typescript
// implements.ts
import trq from 'typed-request/fetch'; //

// const apis: {
//     getData: (options: {
//         id: string;
//     }) => Promise<TRequestResponse<{
//         id: string;
//     }[]>>;
// }
const apis = apiDefs(trq);

const api = oneApiDef(trq);

// usage.ts

// resp: TRequestResponse<{
//     id: string;
// }[]>
const resp = await apis.getData({
    id: '1'
});

const resp2 = await api({
    id: '1'
});
```
