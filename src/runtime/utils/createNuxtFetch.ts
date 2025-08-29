import type { AsyncDataOptions } from '#app'
import type { NitroFetchRequest, TypedInternalResponse } from 'nitropack/types'
import type { ResponseType as _ResponseType, FetchError, FetchOptions } from 'ofetch'
import type { MaybeRefOrGetter, MultiWatchSources, Ref } from 'vue'
import type { AvailableRouterMethod, KeysOf } from '../types/nitro'
import { refreshNuxtData, useFetch, useNuxtData } from '#app'
import { useId } from 'reka-ui'

type ComputedOptions<T extends Record<string, any>> = {
  // eslint-disable-next-line ts/no-unsafe-function-type
  [K in keyof T]: T[K] extends Function ? T[K] : ComputedOptions<T[K]> | Ref<T[K]> | T[K]
}

interface NitroFetchOptions<R extends NitroFetchRequest, M extends AvailableRouterMethod<R> = AvailableRouterMethod<R>, DataT = any> extends FetchOptions<_ResponseType, DataT> {
  method?: M
}

type ComputedFetchOptions<R extends NitroFetchRequest, M extends AvailableRouterMethod<R>, DataT = any> = ComputedOptions<NitroFetchOptions<R, M, DataT>>

export interface UseFetchOptions<
  ResT,
  DataT = ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = undefined,
  R extends NitroFetchRequest = string & {},
  M extends AvailableRouterMethod<R> = AvailableRouterMethod<R>,
> extends Omit<AsyncDataOptions<ResT, DataT, PickKeys, DefaultT>, 'watch'>, ComputedFetchOptions<R, M, DataT> {
  key?: MaybeRefOrGetter<string>
  $fetch?: typeof globalThis.$fetch
  watch?: MultiWatchSources | false
}

export type FetchResult<ReqT extends NitroFetchRequest, M extends AvailableRouterMethod<ReqT>> = TypedInternalResponse<ReqT, unknown, Lowercase<M>>

interface CreateNuxtFetchOptions<
  R extends NitroFetchRequest = string & {},
  M extends AvailableRouterMethod<R> = AvailableRouterMethod<R>,
  DefaultT = undefined,
> {
  method?: M
  key?: string
  default?: DefaultT | (() => DefaultT)
}

export function createNuxtFetch<
  ResT = void,
  ErrorT = FetchError,
  ReqT extends NitroFetchRequest = NitroFetchRequest,
  Method extends AvailableRouterMethod<ReqT> = ResT extends void ? 'get' extends AvailableRouterMethod<ReqT> ? 'get' : AvailableRouterMethod<ReqT> : AvailableRouterMethod<ReqT>,
  _ResT = ResT extends void ? FetchResult<ReqT, Method> : ResT,
  DataT = _ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = undefined,
>(
  request: Ref<ReqT> | ReqT | (() => ReqT),
  options?: CreateNuxtFetchOptions<ReqT, Method, DefaultT>,
) {
  const key = useId(options?.key, 'nuxt-fetch')

  return () => ({
    key,
    data: useNuxtData<DataT>(key).data,
    refresh: () => refreshNuxtData(key),
    fetch: (
      opts?: Omit<UseFetchOptions<_ResT, DataT, PickKeys>, 'key' | 'method' | 'default'>,
    ) => {
      return useFetch<ResT, ErrorT, ReqT, Method, _ResT, DataT, PickKeys, DefaultT>(request, {
        default: options?.default as any,
        method: options?.method as any,
        ...opts,
        key,
      })
    },
  })
}
