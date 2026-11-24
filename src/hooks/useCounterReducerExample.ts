import { useReducer } from 'react';

type Action = { type: 'increment' } | { type: 'decrement' };
type State = number;

export const reducer = (state: State, action: Action) => {
  if (action.type === 'increment') {
    return state + 1;
  }
  if (action.type === 'decrement') {
    return state - 1;
  }
  return state;
};

// Initializer function for useReducer to avoid heavy initialization on every render
const initializer = (initialCount: number) => initialCount;

export const useCounterReducerExample = (initialCount = 0) => {
  // Use the useReducer hook with the reducer, initial count, and initializer function
  const [count, dispatch] = useReducer(reducer, initialCount, initializer);

  return {
    count,
    increment: () => dispatch({ type: 'increment' }),
    decrement: () => dispatch({ type: 'decrement' }),
  };
};
