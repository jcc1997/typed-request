/**
 * typed-request 的 xhr 实现
 */
import { factory } from "../../src/index";
import type {
  RequestBody,
  TRequestOptions,
  TRequestResponse,
} from "../../src/interface";
import { buildUrl, isObject } from "../../src/utils";

class TypedRequestXhrError extends Error {
  request: any;
  response: any;
  constructor(msg: string, request?: any, response?: any) {
    super(msg);
    this.request = request;
    this.response = response;
  }
}

const ignoreDuplicateOf = [
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent",
];

function parseHeaders(headers: string) {
  const parsed: Record<string, string | string[]> = {};
  let key: string;
  let val: string;
  let i;

  if (!headers) {
    return parsed;
  }

  headers.split("\n").forEach(function parser(line: string) {
    i = line.indexOf(":");
    key = line.slice(0, i).trim().toLowerCase();
    val = line.slice(i + 1).trim();

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === "set-cookie") {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat(val);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
      }
    }
  });

  return parsed;
}

function transformData<D extends any>(
  data: D,
  headers: Record<string, string>
): XMLHttpRequestBodyInit | null {
  if (!data) {
    delete headers["Content-Type"];
    return null;
  }
  if (
    data instanceof FormData ||
    data instanceof ArrayBuffer ||
    data instanceof Blob
  ) {
    return data;
  }
  if (data instanceof URLSearchParams) {
    headers["Content-Type"] = "application/x-www-form-urlencoded;charset=utf-8";
    return data;
  }
  if (isObject(data) || headers["Content-Type"]?.includes("application/json")) {
    headers["Content-Type"] = "application/json;charset=utf-8";
    return JSON.stringify(data);
  }
  return data as XMLHttpRequestBodyInit;
}

function basic<
  T extends RequestBody = RequestBody,
  R extends TRequestResponse["data"] = TRequestResponse["data"]
>(options: TRequestOptions<T>): Promise<TRequestResponse<R>> {
  return new Promise<TRequestResponse<R>>((resolve, reject) => {
    const { url, data, params, query, method, headers, init, responseType } =
      options;

    const fullPath = buildUrl(url, query || {}, params || {});
    let request: XMLHttpRequest | null = new XMLHttpRequest();
    const _headers = {
      Accept: "application/json, text/plain, */*",
      ...(["POST", "PUT", "PATCH"].includes(method)
        ? {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
          }
        : {}),
      ...headers,
    };

    let requestData = transformData(data, _headers);

    request.open(method.toUpperCase(), fullPath, true);

    if (init && "withCredentials" in init) {
      request.withCredentials = init.withCredentials;
    }

    if (init?.timeout) {
      // Set the request timeout in MS
      request.timeout = init.timeout;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== "stream") {
      request.responseType = responseType;
    }

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      const responseHeaders =
        "getAllResponseHeaders" in request
          ? parseHeaders(request.getAllResponseHeaders())
          : {};
      let _responseType;
      if (request.responseType) {
        _responseType = request.responseType;
      } else {
        _responseType = responseType;
        const contentType = responseHeaders["content-type"];
        if (contentType?.includes("application/json")) {
          _responseType = "json";
        } else if (contentType?.includes("text")) {
          _responseType = "text";
        }
      }

      let responseData;
      switch (_responseType) {
        case "json":
          responseData = JSON.parse(request.responseText);
          break;
        case "text":
          responseData = request.responseText
          break;
        default:
          responseData = request.response;
      }

      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: options,
        request: request,
      };
      resolve(response);

      // Clean up request
      request = null;
    }

    if ("onloadend" in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      // @ts-ignore
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (
          request.status === 0 &&
          !(request.responseURL && request.responseURL.indexOf("file:") === 0)
        ) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    request.ontimeout = function handleTimeout() {
      reject(new TypedRequestXhrError("Request timeout ", request));

      // Clean up request
      request = null;
    };

    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }
      reject(new TypedRequestXhrError("Request timeout ", request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      if (!request) {
        return;
      }
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(new TypedRequestXhrError("Network Error", request));

      // Clean up request
      request = null;
    };

    // Handle progress if needed
    if (init && typeof init.onDownloadProgress === "function") {
      request.addEventListener("progress", init.onDownloadProgress);
    }

    Object.entries(_headers).forEach(([key, val]) => {
      request!.setRequestHeader(key, val);
    });

    // Send the request
    request.send(requestData);
  });
}

// export typed-request 的实现
export default factory(basic, []);
