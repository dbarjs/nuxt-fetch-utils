import type { DataFetchContext } from '../components/NuxtFetch.vue'
import { createContext } from 'reka-ui'

export const [injectDataFetchContext, provideNuxtFetchContext] = createContext<DataFetchContext>('NuxtFetch')
