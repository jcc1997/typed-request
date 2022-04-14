import nodeFetch, { Request, Headers } from "node-fetch";

// @ts-expect-error override
window.fetch = nodeFetch;
// @ts-expect-error override
window.Request = Request;
window.Headers = Headers;

// @ts-expect-error override
global.fetch = nodeFetch;
// @ts-expect-error override
global.Request = Request;
global.Headers = Headers;

export {};
