import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getDb } from '../db/database';
import { getAllWines } from '../db/queries';
import { wineReducer, initialState, WineState, WineAction } from './WineReducer';

interface WineContextValue {
  state: WineState;
  dispatch: React.Dispatch<WineAction>;
  reload: () => Promise<void>;
}

const WineContext = createContext<WineContextValue | null>(null);

export function WineProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wineReducer, initialState);

  const reload = async () => {
    dispatch({ type: 'LOAD_START' });
    try {
      const db = await getDb();
      const wines = await getAllWines(db);
      dispatch({ type: 'LOAD_SUCCESS', payload: wines });
    } catch (e) {
      dispatch({ type: 'LOAD_ERROR', payload: (e as Error).message });
    }
  };

  useEffect(() => {
    reload();
  }, []);

  return (
    <WineContext.Provider value={{ state, dispatch, reload }}>
      {children}
    </WineContext.Provider>
  );
}

export function useWineContext(): WineContextValue {
  const ctx = useContext(WineContext);
  if (!ctx) throw new Error('useWineContext must be used inside WineProvider');
  return ctx;
}
