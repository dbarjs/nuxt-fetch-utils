import type { Ref } from 'vue'
import { createContext } from 'reka-ui'

export interface DataKeysContext {
  keys: Ref<string[]>
  register: (key: string) => void
}

export const [injectDataKeysContext, provideDataKeysContext] = createContext<DataKeysContext>('DataKeys')
