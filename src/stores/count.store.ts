import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CountActions {
  increment: () => void
  decrement: () => void
}

interface CountStore {
  count: number
  isEven: () => boolean
  actions: CountActions
}

export const useCountStore = create<CountStore>()(
  persist(
    (set, get) => ({
      count: 0,
      isEven: () => get().count % 2 === 0,
      actions: {
        increment: () => set((state) => ({ count: state.count + 1 })),
        decrement: () => set((state) => ({ count: state.count - 1 })),
      },
    }),
    {
      name: 'countStore',
      partialize: (state) => ({ count: state.count }),
    },
  ),
)

// Custom hooks
// ------------

export const useCount = () => useCountStore((state) => state.count)
export const useIsEven = () => useCountStore((state) => state.isEven())
export const useCountActions = () => useCountStore((state) => state.actions)
