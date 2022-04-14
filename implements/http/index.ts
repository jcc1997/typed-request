/**
 * typed-request 的 http 实现
 */
import { factory } from "../../src/index";
import {
  ResponseType,
  RequestBody,
  TRequestOptions,
  TRequestResponse,
} from "../../src/interface";
import { buildUrl, isObject } from "../../src/utils";

function transformData<D extends any>(data: D, headers: Headers) {
  if (
    data instanceof FormData ||
    data instanceof ArrayBuffer ||
    data instanceof Blob ||
    data instanceof ReadableStream
  ) {
    return data;
  }
  if (data instanceof URLSearchParams) {
    headers.set(
      "Content-Type",
      "application/x-www-form-urlencoded;charset=utf-8"
    );
    return data;
  }
  if (
    isObject(data) ||
    headers.get("Content-Type")?.includes("application/json")
  ) {
    headers.set("Content-Type", "application/json;charset=utf-8");
    return JSON.stringify(data);
  }
  return data as BodyInit;
}

async function basic<
  T extends RequestBody = RequestBody,
  R extends TRequestResponse["data"] = TRequestResponse["data"]
>(options: TRequestOptions<T>): Promise<TRequestResponse<R>> {
  throw new Error("not implement");
}

// export typed-request 的实现
export default factory(basic, []);
