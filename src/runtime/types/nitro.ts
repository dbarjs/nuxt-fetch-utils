import type { AsyncDataRequestStatus } from '#app'
import type { AvailableRouterMethod as _AvailableRouterMethod, NitroFetchRequest, TypedInternalResponse } from 'nitropack/types'
import type { FetchOptions } from 'ofetch'
import type { Ref } from 'vue'

export type AvailableRouterMethod<R extends NitroFetchRequest> = _AvailableRouterMethod<R> | Uppercase<_AvailableRouterMethod<R>>
export type FetchResult<ReqT extends NitroFetchRequest, M extends AvailableRouterMethod<ReqT>> = TypedInternalResponse<ReqT, unknown, Lowercase<M>>
export type KeysOf<T> = Array<
  T extends T // Include all keys of union types, not just common keys
    ? keyof T extends string
      ? keyof T
      : never
    : never
>

export type ComputedOptions<T extends Record<string, any>> = {
  // eslint-disable-next-line ts/no-unsafe-function-type
  [K in keyof T]: T[K] extends Function ? T[K] : ComputedOptions<T[K]> | Ref<T[K]> | T[K]
}

interface NitroFetchOptions<R extends NitroFetchRequest, M extends AvailableRouterMethod<R> = AvailableRouterMethod<R>> extends FetchOptions {
  method?: M
}

export type ComputedFetchOptions<R extends NitroFetchRequest, M extends AvailableRouterMethod<R>> = ComputedOptions<NitroFetchOptions<R, M>>

export type PickFrom<T, K extends Array<string>> = T extends Array<any>
  ? T
  : T extends Record<string, any>
    ? keyof T extends K[number]
      ? T // Exact same keys as the target, skip Pick
      : K[number] extends never
        ? T
        : Pick<T, K[number]>
    : T

export type DataFetchStatus = AsyncDataRequestStatus
