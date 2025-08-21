<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui'
import { useIntersectionObserver } from '@vueuse/core'
import { Primitive } from 'reka-ui'
import { computed, onMounted, useTemplateRef } from 'vue'
import { injectDataFetchContext } from '../utils/context'

export type NuxtFetchWrapperProps = PrimitiveProps & {
  forceMount?: boolean
}

const props = defineProps<NuxtFetchWrapperProps>()

const visibilityElementRef = useTemplateRef('visibility-element')

const dataFetchContext = injectDataFetchContext()

const isVisible = computed(() => {
  if (props.forceMount) {
    return true
  }

  if (dataFetchContext.isVisibilityHandlerEnabled.value || dataFetchContext.isInteractionHandlerEnabled.value) {
    return false
  }

  return dataFetchContext.status.value === 'success'
})

if (dataFetchContext.isVisibilityHandlerEnabled.value) {
  const { stop, resume, pause } = useIntersectionObserver(visibilityElementRef, (entries) => {
    if (entries.some(entry => entry.isIntersecting)) {
      dataFetchContext.onVisibility({
        stop,
        resume,
        pause,
      })
    }
  }, dataFetchContext.intersectionObserverOptions.value)
}

function addInteractionListeners() {
  const element = visibilityElementRef.value?.$el

  if (!element) {
    return
  }

  dataFetchContext.interactionEvents.value.forEach((eventName) => {
    element.addEventListener(eventName, () => {
      dataFetchContext.onInteraction()
    }, { once: true })
  })
}

onMounted(() => {
  if (dataFetchContext.isInteractionHandlerEnabled.value) {
    addInteractionListeners()
  }
})
</script>

<template>
  <Primitive
    v-if="isVisible"
    ref="visibility-element"
    :as="props.as"
    :as-child="props.asChild"
  >
    <slot />
  </Primitive>
</template>
