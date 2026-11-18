import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/about-creators")({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: "/about-the-artists",
      search: true,
      hash: location.hash,
      replace: true,
    });
  },
});
