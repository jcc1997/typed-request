/**
 * typed-request 的 xhr 实现
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
  throw new Error("not implement");
}

async function basic<
  T extends RequestBody = RequestBody,
  R extends TRequestResponse["data"] = TRequestResponse["data"]
>(options: TRequestOptions<T>): Promise<TRequestResponse<R>> {
  throw new Error("not implement");
}

// export typed-request 的实现
export default factory(basic, []);
