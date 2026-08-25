export type StoreListener<T> = (state: T) => void;

export type Store<T> = {
  getState: () => T;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: StoreListener<T>) => () => void;
};

export const createStore = <T>(initialState: T): Store<T> => {
  let state = initialState;
  const listeners = new Set<StoreListener<T>>();

  return {
    getState: () => state,
    setState: (partial) => {
      const patch = typeof partial === "function" ? partial(state) : partial;
      state = { ...state, ...patch };
      listeners.forEach((listener) => listener(state));
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
};

export const createSliceSetter = <T, K extends keyof T>(
  store: Store<T>,
  key: K
) => (partial: Partial<T[K]> | ((slice: T[K]) => Partial<T[K]>)) => {
  store.setState((current) => {
    const prevSlice = current[key];
    const patch = typeof partial === "function" ? partial(prevSlice) : partial;
    return {
      ...current,
      [key]: { ...prevSlice, ...patch }
    };
  });
};
