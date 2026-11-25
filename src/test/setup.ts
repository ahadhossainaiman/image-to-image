import "@testing-library/jest-dom/vitest";

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
});

class ObserverStub {
  observe() {}
  disconnect() {}
}

Object.defineProperties(window, {
  ResizeObserver: { writable: true, value: ObserverStub },
  IntersectionObserver: { writable: true, value: ObserverStub },
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
