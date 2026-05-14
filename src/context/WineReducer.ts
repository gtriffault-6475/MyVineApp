import type { Wine } from '../types/wine';

export interface WineState {
  wines: Wine[];
  loading: boolean;
  error: string | null;
}

export type WineAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: Wine[] }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'ADD_WINE'; payload: Wine }
  | { type: 'UPDATE_WINE'; payload: Wine }
  | { type: 'DELETE_WINE'; payload: number };

export const initialState: WineState = {
  wines: [],
  loading: false,
  error: null,
};

export function wineReducer(state: WineState, action: WineAction): WineState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null };
    case 'LOAD_SUCCESS':
      return { wines: action.payload, loading: false, error: null };
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_WINE':
      return { ...state, wines: [action.payload, ...state.wines] };
    case 'UPDATE_WINE':
      return {
        ...state,
        wines: state.wines.map((w) => (w.id === action.payload.id ? action.payload : w)),
      };
    case 'DELETE_WINE':
      return { ...state, wines: state.wines.filter((w) => w.id !== action.payload) };
    default:
      return state;
  }
}
