import { useContext } from 'react';
import { ReadingListContext } from './contexts';

export const useReadingListState = () => {
  const { items } = useContext(ReadingListContext);

  return { items };
};

export const useReadingListActions = () => {
  const { addItem, removeItem, toggleItemCompletion } =
    useContext(ReadingListContext);

  return { addItem, removeItem, toggleItemCompletion };
};
