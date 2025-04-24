# Zustand example

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
