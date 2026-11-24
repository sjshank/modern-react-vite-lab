export type ReadingListItem = {
  id: string;
  title: string;
  completed?: boolean;
};

export type ReadingListState = {
  items: ReadingListItem[];
};

export type ReadingListAction =
  | { type: 'ADD_ITEM'; payload: ReadingListItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'TOGGLE_ITEM_COMPLETION'; payload: string };

export type ReadingListContextType = {
  items: ReadingListItem[];
  addItem: (item: ReadingListItem) => void;
  removeItem: (id: string) => void;
  toggleItemCompletion: (id: string) => void;
};
