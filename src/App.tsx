import { useCount, useCountActions, useIsEven } from './stores/count.store'

const DisplayCount = () => {
  const count = useCount()
  const isEven = useIsEven()

  return (
    <div className="counter-display">
      <span>Count: {count}</span>
      <span>Is even: {isEven.toString()}</span>
    </div>
  )
}

const CountActions = () => {
  const { increment, decrement } = useCountActions()

  return (
    <div className="counter-actions">
      <button onClick={decrement}>Decrement</button>
      <button onClick={increment}>Increment</button>
    </div>
  )
}

function App() {
  return (
    <div className="counter-container">
      <DisplayCount />
      <hr />
      <CountActions />
    </div>
  )
}

export default App
