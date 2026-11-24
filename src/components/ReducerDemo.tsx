import {
  reducer,
  useCounterReducerExample,
} from '@hooks/useCounterReducerExample';
import { useImmerReducer } from 'use-immer';

export const ReducerDemo = () => {
  const { count, increment, decrement } = useCounterReducerExample(0);

  // Reducers must remain synchronous and pure. Perform asynchronous work in an event handler or effect, then dispatch the result
  const handleAsyncAction = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Dispatch the increment action after the async delay
    increment();
  };
  return (
    <div>
      <h2>Reducer Demo</h2>
      <p>Count: {count}</p>
      <button style={{ marginRight: '8px' }} onClick={increment}>
        Increment
      </button>
      <button style={{ marginRight: '8px' }} onClick={decrement}>
        Decrement
      </button>
      <button onClick={handleAsyncAction}>Increment Async</button>
    </div>
  );
};

export const ImmerReducerDemo = () => {
  const [count, dispatch] = useImmerReducer(reducer, 0);

  return (
    <div>
      <h2>Immer Reducer Demo using useImmerReducer hook</h2>
      <p>Count: {count}</p>
      <button
        style={{ marginRight: '8px' }}
        onClick={() => dispatch({ type: 'increment' })}
      >
        Increment
      </button>
      <button onClick={() => dispatch({ type: 'decrement' })}>Decrement</button>
    </div>
  );
};

// Root reducer function combining cart and user reducers
// When we should use this approach ? -
// This approach is useful when you have multiple slices of state managed by different reducers and you want to combine them into a single root reducer for use with a store like Redux.

/*export const rootReducerFunction = (state: RootState, action: RootAction) => {
  return {
    ...state,
    cart: cartReducer(state.cart, action),
    user: userReducer(state.user, action),
  };
};*/
