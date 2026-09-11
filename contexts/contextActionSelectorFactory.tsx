import {
  createContext,
  memo,
  useContext,
  useEffect,
  useLayoutEffect,
  useSyncExternalStore,
} from "react";

type ActionStateSelectorContext<A, S> = {
  Provider: React.MemoExoticComponent<FC>;
  getCurrentState: () => S;
  useContextActions: () => A;
  useStateSelector: <T>(selector: (state: S) => T) => T;
};

type ContextEntry = {
  ActionsContext: React.Context<unknown>;
  store: { current: unknown; listeners: Set<() => void> };
};

// useLayoutEffect warns during SSR; notifications only run client-side
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

// Fast Refresh re-evaluates a context module without remounting every consumer.
// A context created fresh on each evaluation would leave those consumers reading
// the old object, which falls back to the empty default — actions come back
// undefined and selectors read nothing. Keying by name keeps one context and one
// store per logical context for the life of the page. In production a module is
// evaluated once, so this resolves to a single entry and costs nothing.
const globalScope = globalThis as typeof globalThis & {
  __contextRegistry?: Map<string, ContextEntry>;
};

globalScope.__contextRegistry ??= new Map<string, ContextEntry>();

const registry = globalScope.__contextRegistry;

// Actions live in a context whose value keeps a stable identity; state is
// only reachable through selectors, so consumers re-render when their
// selected value changes rather than on every state update
const contextActionSelectorFactory = <A, S>(
  name: string,
  useContextState: () => { actions: A; state: S },
  ContextComponent?: React.JSX.Element
): ActionStateSelectorContext<A, S> => {
  let entry = registry.get(name);

  if (!entry) {
    entry = {
      ActionsContext: createContext<unknown>(Object.create(null)),
      store: {
        current: Object.create(null) as unknown,
        listeners: new Set<() => void>(),
      },
    };
    registry.set(name, entry);
  }

  const ActionsContext = entry.ActionsContext as React.Context<A>;
  const store = entry.store as {
    current: S;
    listeners: Set<() => void>;
  };
  const subscribe = (listener: () => void): (() => void) => {
    store.listeners.add(listener);

    return () => store.listeners.delete(listener);
  };
  const Provider = memo<FC>(({ children }) => {
    const { actions, state } = useContextState();

    // Mirrored during render so same-commit mounts read current state
    store.current = state;

    useIsomorphicLayoutEffect(() => {
      store.listeners.forEach((listener) => listener());
    }, [state]);

    return (
      <ActionsContext value={actions}>
        {children}
        {ContextComponent}
      </ActionsContext>
    );
  });

  return {
    Provider,
    // Non-subscribing read for event handlers that only need current state
    getCurrentState: () => store.current,
    useContextActions: () => useContext(ActionsContext),
    // Selectors must return referentially stable values for unchanged data
    useStateSelector: <T,>(selector: (state: S) => T): T =>
      useSyncExternalStore(
        subscribe,
        () => selector(store.current),
        () => selector(store.current)
      ),
  };
};

export default contextActionSelectorFactory;
