import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  HeadContent,
  createRootRouteWithContext,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "../components/SiteHeader";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70svh] items-center justify-center px-5 py-20">
      <div className="glass-panel max-w-xl p-10 text-center sm:p-16">
        <p className="eyebrow">A path into the woods</p>
        <h1 className="mt-5 text-7xl">404</h1>
        <h2 className="mt-3 text-3xl">This story is not here</h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          The page you are looking for may have moved, or perhaps it was only a little magic.
        </p>
        <Link to="/" className="btn-art mt-8">
          Return to the atelier
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error("App error boundary caught:", error);
  const router = useRouter();
  return (
    <div className="flex min-h-[70svh] items-center justify-center px-5 py-20">
      <div className="glass-panel max-w-lg p-10 text-center">
        <h1 className="text-4xl">This page didn’t load</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Something interrupted the story. Try again or return to the atelier.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-art"
          >
            Try again
          </button>
          <a href="/" className="btn-outline-art">
            Return home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <HeadContent />
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
    </QueryClientProvider>
  );
}
