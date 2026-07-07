import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getDb } from '../db/database';
import { getAllCellarEntries } from '../db/cellarQueries';
import { getAllCaves } from '../db/caveQueries';
import type { CellarEntry } from '../types/cellar';
import type { Cave } from '../types/cave';

interface CellarState {
  entries: CellarEntry[];
  caves: Cave[];
  loading: boolean;
  error: string | null;
}

type CellarAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: { entries: CellarEntry[]; caves: Cave[] } }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'ADD_ENTRY'; payload: CellarEntry }
  | { type: 'UPDATE_ENTRY'; payload: CellarEntry }
  | { type: 'DELETE_ENTRY'; payload: number }
  | { type: 'ADD_CAVE'; payload: Cave }
  | { type: 'UPDATE_CAVE'; payload: Cave }
  | { type: 'DELETE_CAVE'; payload: number };

const initialState: CellarState = { entries: [], caves: [], loading: false, error: null };

function cellarReducer(state: CellarState, action: CellarAction): CellarState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null };
    case 'LOAD_SUCCESS':
      return { entries: action.payload.entries, caves: action.payload.caves, loading: false, error: null };
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
    case 'ADD_CAVE':
      return { ...state, caves: [...state.caves, action.payload] };
    case 'UPDATE_CAVE':
      return {
        ...state,
        caves: state.caves.map((c) => (c.id === action.payload.id ? action.payload : c)),
      };
    case 'DELETE_CAVE':
      return {
        ...state,
        caves: state.caves.filter((c) => c.id !== action.payload),
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
      const [entries, caves] = await Promise.all([
        getAllCellarEntries(db),
        getAllCaves(db),
      ]);
      dispatch({ type: 'LOAD_SUCCESS', payload: { entries, caves } });
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
