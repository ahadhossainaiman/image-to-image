import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("redirects old artist page links and preserves the query and anchor", async () => {
    const history = createMemoryHistory({ initialEntries: ["/about-creators?ref=menu#alba"] });
    const router = createRouter({ routeTree, history, context: { queryClient: new QueryClient() } });

    await router.load();

    expect(history.location.href).toBe("/about-the-artists?ref=menu#alba");
    expect(router.state.matches.at(-1)?.routeId).toBe("/about-the-artists");
  });
});
