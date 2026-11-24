import { createContext } from 'react';
import type { ReadingListContextType, ReadingListState } from './types';

export const initialReadingListState: ReadingListState = {
  items: [],
};

export const ReadingListContext = createContext<ReadingListContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  toggleItemCompletion: () => {},
});
