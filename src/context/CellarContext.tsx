import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getDb } from '../db/database';
import { getAllCellarEntries } from '../db/cellarQueries';
import type { CellarEntry } from '../types/cellar';

interface CellarState {
  entries: CellarEntry[];
  loading: boolean;
  error: string | null;
}

type CellarAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: CellarEntry[] }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'ADD_ENTRY'; payload: CellarEntry }
  | { type: 'UPDATE_ENTRY'; payload: CellarEntry }
  | { type: 'DELETE_ENTRY'; payload: number };

const initialState: CellarState = { entries: [], loading: false, error: null };

function cellarReducer(state: CellarState, action: CellarAction): CellarState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null };
    case 'LOAD_SUCCESS':
      return { entries: action.payload, loading: false, error: null };
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_ENTRY':
      return {
        ...state,
        entries: [...state.entries, action.payload].sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
      };
    case 'UPDATE_ENTRY':
      return {
        ...state,
        entries: state.entries.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
    case 'DELETE_ENTRY':
      return {
        ...state,
        entries: state.entries.filter((e) => e.id !== action.payload),
      };
    default:
      return state;
  }
}

interface CellarContextValue {
  state: CellarState;
  dispatch: React.Dispatch<CellarAction>;
  reload: () => Promise<void>;
}

const CellarContext = createContext<CellarContextValue | null>(null);

export function CellarProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cellarReducer, initialState);

  const reload = async () => {
    dispatch({ type: 'LOAD_START' });
    try {
      const db = await getDb();
      const entries = await getAllCellarEntries(db);
      dispatch({ type: 'LOAD_SUCCESS', payload: entries });
    } catch (e) {
      dispatch({ type: 'LOAD_ERROR', payload: (e as Error).message });
    }
  };

  useEffect(() => {
    reload();
  }, []);

  return (
    <CellarContext.Provider value={{ state, dispatch, reload }}>
      {children}
    </CellarContext.Provider>
  );
}

export function useCellarContext(): CellarContextValue {
  const ctx = useContext(CellarContext);
  if (!ctx) throw new Error('useCellarContext must be used inside CellarProvider');
  return ctx;
}
