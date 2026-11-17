import { useSyncExternalStore } from "react";

let open = false;
const listeners = new Set<() => void>();

export function setCartDrawerOpen(next: boolean) {
  if (open === next) return;
  open = next;
  listeners.forEach((listener) => listener());
}

export function useCartDrawerOpen() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => open,
    () => false,
  );
}
