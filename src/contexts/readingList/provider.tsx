import { useMemo, useReducer, type ReactNode } from 'react';
import { initialReadingListState, ReadingListContext } from './contexts';
import { readingListReducer } from './reducer';

const initialStateInitiator = () => initialReadingListState;

export const ReadingListProvider = ({ children }: { children: ReactNode }) => {
  'use memo';
  const [state, dispatch] = useReducer(
    readingListReducer,
    initialReadingListState,
    initialStateInitiator,
  );
  const memoizedItem = useMemo(() => state.items, [state.items]);

  const addItem = (item: (typeof state.items)[0]) =>
    dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id: string) =>
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  const toggleItemCompletion = (id: string) =>
    dispatch({ type: 'TOGGLE_ITEM_COMPLETION', payload: id });

  return (
    <ReadingListContext.Provider
      value={{
        items: memoizedItem,
        addItem,
        removeItem,
        toggleItemCompletion,
      }}
    >
      {children}
    </ReadingListContext.Provider>
  );
};
