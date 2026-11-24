import type { ReadingListAction, ReadingListState } from './types';
export const readingListReducer = (
  state: ReadingListState,
  action: ReadingListAction,
) => {
  switch (action.type) {
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    case 'TOGGLE_ITEM_COMPLETION':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload
            ? { ...item, completed: !item.completed }
            : item,
        ),
      };
    default:
      return state;
  }
};
