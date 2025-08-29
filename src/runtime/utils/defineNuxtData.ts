import { refreshNuxtData, useNuxtData } from '#app'

export function defineNuxtData<T>(key: string) {
  return () => ({
    key,
    data: useNuxtData<T>(key).data,
    refresh: () => refreshNuxtData(key),
  })
}
