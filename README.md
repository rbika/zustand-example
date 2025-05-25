# Zustand reference

Code reference to work with [Zustand](https://zustand.docs.pmnd.rs/getting-started/introduction).

Some common patterns and best practices:

- When using TypeScript, instead of writing `create(...)`, you have to write `create<T>()(...)`. This is a workaround for [microsoft/TypeScript#10571](https://github.com/microsoft/TypeScript/issues/10571).

  ```typescript
  // Notice the extra parentheses () along with the type parameter.
  const useStore = create<State>()((set) => ({
    count: 0,
  }))
  ```

- Use **selector functions** to grab only the necessary parts from the store:

  ```typescript
  // Good
  // Using a selector function to grab only "count" from the store.
  const count = useStore((state) => state.count)

  // Bad
  // Grabbing the entire store and then destructuring "count" from it. This component will re-render
  // whenever any part of the state changes, not just "count".
  const { count } = useStore()
  ```

- Export **custom hooks** to encapsulate the selector functions:

  ```typescript
  export const useCount = () => useCountStore((state) => state.count)
  ```
- **Separate actions from the store data** and export then as a custom hook:

  ```typescript
  // count.store.ts

  export const useCountStore = create<CountStore>()((set) => ({
    count: 0,
    actions: {
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
    },
  }))

  export const useCountActions = () => useCountStore((state) => state.actions)
  ```

  ```typescript
  // app.ts

  // Here it is ok to destructure the state because the actions object should
  // never change.
  const { increment } = useCountActions()
  ```

- Define **computed properties** inside the store using the `get` function:

  ```typescript
  export const useCountStore = create<CountStore>()((set, get) => ({
    count: 0,
    isEven: () => get().count % 2 === 0,
  }))

  export const useIsEven = () => useCountStore((state) => state.isEven())
  ```

- Zustand provides some utility middlewares like `immer`, `persist` and `devtools`. In this example we are using `persist` to automatically set up a local storage:

  ```typescript
  export const useCountStore = create<CountStore>()(
  persist(
    (set, get) => ({
      count: 0,
      ...
    }),
    {
      name: 'countStore',
      partialize: (state) => ({ count: state.count }),
    },
  ),
  )
  ```

- When using Zustand with Next.js the recommended approach is to share the store with a context provider.

  ```typescript
  // store.tsx

  'use client'

  import { type ReactNode, createContext, useState, useContext } from 'react'
  import { useStore } from 'zustand'
  import { createStore } from 'zustand/vanilla'

  // Zustand Store
  // -------------

  export interface CounterState {
    count: number
  }

  export interface CounterActions {
    actions: {
      decrementCount: () => void
      incrementCount: () => void
    }
  }

  export interface CounterStore Extends CounterState, CounterActions {}

  const createCounterStore = () => {
    return createStore<CounterStore>()((set) => ({
      ...initState,
      decrementCount: () => set((state) => ({ count: state.count - 1 })),
      incrementCount: () => set((state) => ({ count: state.count + 1 })),
    }))
  }

  // React Context
  // -------------

  export type CounterStoreApi = ReturnType<typeof createCounterStore>

  const CounterStoreContext = createContext<CounterStoreApi | null>(null)

  export interface CounterStoreProviderProps {
    children: ReactNode
  }

  export const CounterStoreProvider = ({
    children,
  }: CounterStoreProviderProps) => {
    const [store] = useState<CounterStoreApi>(createCounterStore)

    return (
      <CounterStoreContext.Provider value={store}>
        {children}
      </CounterStoreContext.Provider>
    )
  }

  export const useCounterStore = <T,>(
    selector: (store: CounterStore) => T,
  ): T => {
    const counterStoreContext = useContext(CounterStoreContext)

    if (!counterStoreContext) {
      throw new Error(`useCounterStore must be used within CounterStoreProvider`)
    }

    return useStore(counterStoreContext, selector)
  }

  // Selectors
  // ---------

  const counterSelector = (state: CounterStore) => state.counter
  const actionsSelector = (state: CounterStore) => state.actions

  export const useCounter = () => useCounterStore(counterSelector)
  export const useCounterStoreActions = () => useCounterStore(actionsSelector)
  ```
  ```typescript
  // app/layout.tsx

  import { CounterStoreProvider } from '@/providers/counter-store-provider'

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode
  }>) {
    return (
      <html lang="en">
        <body>
          <CounterStoreProvider>{children}</CounterStoreProvider>
        </body>
      </html>
    )
  }
  ```

## References

- [https://www.youtube.com/watch?v=6tEQ1nJZ51w](https://www.youtube.com/watch?v=6tEQ1nJZ51w)
- [https://zustand.docs.pmnd.rs/guides/nextjs](https://zustand.docs.pmnd.rs/guides/nextjs)
    - [https://github.com/pmndrs/zustand/discussions/2326](https://github.com/pmndrs/zustand/discussions/2326)
    - [https://github.com/pmndrs/zustand/discussions/2426](https://github.com/pmndrs/zustand/discussions/2426)
- [https://tkdodo.eu/blog/working-with-zustand](https://tkdodo.eu/blog/working-with-zustand)
- [https://tkdodo.eu/blog/zustand-and-react-context](https://tkdodo.eu/blog/zustand-and-react-context)