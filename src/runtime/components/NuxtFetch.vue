<script lang="ts">
import type { UseIntersectionObserverOptions } from '@vueuse/core'
import type { NitroFetchRequest } from 'nitropack/types'
import type { FetchError } from 'ofetch'
import type { ComputedRef, Ref } from 'vue'
import type { AvailableRouterMethod, DataFetchStatus, FetchResult } from '../types/nitro'
import type { PathParamsWithOverrides } from '../types/utils'
import type { NuxtFetchWrapperProps } from './NuxtFetchWrapper.vue'
import { useFetch } from '#app'
import { useId } from 'reka-ui'
import { computed, onMounted, ref, watch } from 'vue'
import { provideNuxtFetchContext } from '../utils/context'
import { injectDataKeysContext, provideDataKeysContext } from '../utils/data-keys'
import NuxtFetchWrapper from './NuxtFetchWrapper.vue'

export interface DataFetchVisibilityHandlerCallbacks {
  stop: () => void
  resume: () => void
  pause: () => void
}

export type DataFetchInteractionEvents = keyof HTMLElementEventMap

export interface DataFetchContext {
  id: string
  data: Ref<unknown>
  error: Ref<FetchError<any> | undefined>
  status: Ref<DataFetchStatus>
  pending: Ref<boolean>
  refresh: (opts?: any) => Promise<void>
  execute: (opts?: any) => Promise<void>
  interactionEvents: ComputedRef<DataFetchInteractionEvents[]>
  isInteractionHandlerEnabled: ComputedRef<boolean>
  intersectionObserverOptions: ComputedRef<UseIntersectionObserverOptions | undefined>
  isVisibilityHandlerEnabled: ComputedRef<boolean>
  clear: () => void
  onVisibility: (callbacks: DataFetchVisibilityHandlerCallbacks) => void
  onInteraction: () => void
}

export interface NuxtFetchRootProps<
  ResT = void,
  ReqT extends NitroFetchRequest = NitroFetchRequest,
  Method extends AvailableRouterMethod<ReqT> = ResT extends void ? 'get' extends AvailableRouterMethod<ReqT> ? 'get' : AvailableRouterMethod<ReqT> : AvailableRouterMethod<ReqT>,
  _ResT = ResT extends void ? FetchResult<ReqT, Method> : ResT,
  ParamsT = ReqT extends string ? PathParamsWithOverrides<ReqT> : never,
> extends NuxtFetchWrapperProps {
  url: Ref<ReqT> | ReqT | (() => ReqT)

  method?: Method
  params?: ParamsT
  query?: Record<string, any>
  watchParams?: boolean
  watchQuery?: boolean

  id?: string

  lazy?: boolean
  server?: boolean
  immediate?: boolean
  unwrapped?: boolean

  fetchOnVisible?: boolean | UseIntersectionObserverOptions
  fetchOnInteraction?: DataFetchInteractionEvents | DataFetchInteractionEvents[]
  fetchOnTrigger?: boolean
  fetchWhen?: boolean

  defaultValue?: any
}
</script>

<script setup lang="ts" generic="ResT = void, ReqT extends NitroFetchRequest = NitroFetchRequest">
const props = defineProps<NuxtFetchRootProps<ResT, ReqT>>()

const id = useId(props.id, 'nuxt-fetch')

const _scopedDataKeys = ref<string[]>([])
const _parentDataKeysContext = injectDataKeysContext(null)
const _contextDataKeys = computed<string[]>({
  get() {
    if (_parentDataKeysContext) {
      return _parentDataKeysContext.keys.value
    }

    return _scopedDataKeys.value
  },
  set(keys: string[]) {
    if (_parentDataKeysContext) {
      _parentDataKeysContext.keys.value = keys
    }
    else {
      _scopedDataKeys.value = keys
    }
  },
})

function _registerDataKey(key: string) {
  if (_parentDataKeysContext) {
    _parentDataKeysContext.register(key)
  }
  else if (!_scopedDataKeys.value.includes(key)) {
    _scopedDataKeys.value.push(key)
  }
}

if (!_parentDataKeysContext) {
  provideDataKeysContext({
    keys: _scopedDataKeys,
    register: _registerDataKey,
  })
}

const isWrapped = computed(() => {
  return !props.unwrapped
})

const immediate = computed(() => {
  if (props.fetchOnInteraction || props.fetchOnVisible || props.fetchOnTrigger || props.fetchWhen) {
    return false
  }

  return props.immediate
})

const interactionEvents = computed(() => {
  if (!props.fetchOnInteraction) {
    return []
  }

  if (Array.isArray(props.fetchOnInteraction)) {
    return props.fetchOnInteraction
  }

  return [props.fetchOnInteraction]
})

const isInteractionHandlerEnabled = computed(() => {
  return !!props.fetchOnInteraction
})

const isVisibilityHandlerEnabled = computed(() => {
  return !!props.fetchOnVisible
})

const intersectionObserverOptions = computed<UseIntersectionObserverOptions | undefined>(() => {
  if (!props.fetchOnVisible) {
    return
  }

  if (props.fetchOnVisible === true) {
    return
  }

  return props.fetchOnVisible
})

const { data, error, status, pending, refresh, execute, clear } = await useFetch(props.url, {
  server: props.server,
  lazy: props.lazy,
  immediate: immediate.value,
  key: id,
})

function onVisibility(callbacks: DataFetchVisibilityHandlerCallbacks) {
  callbacks.stop()
  execute()
}

function onInteraction() {
  execute()
}

watch(() => props.fetchWhen, () => {
  if (props.fetchWhen && status.value === 'idle') {
    execute()
  }
}, {
  immediate: true,
})

provideNuxtFetchContext({
  id,
  data,
  error,
  pending,
  status,
  refresh,
  execute,
  clear,
  isInteractionHandlerEnabled,
  interactionEvents,
  intersectionObserverOptions,
  isVisibilityHandlerEnabled,
  onVisibility,
  onInteraction,
})

onMounted(() => {
  _registerDataKey(id)
})
</script>

<template>
  <NuxtFetchWrapper
    v-if="isWrapped"
    :as="props.as"
    :as-child="props.asChild"
    force-mount
    v-bind="$attrs"
  >
    <slot
      :data="data"
      :error="error"
      :status="status"
      :refresh="refresh"
      :clear="clear"
      :execute="execute"
    />
  </NuxtFetchWrapper>

  <slot
    v-else
    :data="data"
    :error="error"
    :status="status"
    :refresh="refresh"
    :clear="clear"
    :execute="execute"
  />
</template>
