import { Skeleton } from "@/components/ui/skeleton";

export function CatalogLoading({ page }: { page: "shop" | "collection" | "artwork" }) {
  if (page === "artwork") {
    return (
      <div className="mx-auto min-h-[80svh] max-w-[1500px] px-5 pt-7 sm:px-10 md:pt-10" role="status">
        <span className="sr-only">Loading artwork</span>
        <div aria-hidden="true">
          <Skeleton className="h-3 w-36" />
          <div className="mt-4 grid md:mt-7 md:grid-cols-[1.25fr_.75fr] md:gap-10 lg:gap-16">
            <Skeleton className="mx-auto h-[min(42svh,20rem)] w-full max-w-80 md:h-[min(65svh,34rem)] md:max-w-[38rem]" />
            <div className="glass-panel mt-12 space-y-4 p-4 sm:p-6 md:mt-0 md:self-start md:p-7">
              <Skeleton className="h-9 w-2/3" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-[80svh] max-w-[1500px] px-4 pt-8 sm:px-10 md:pt-16 lg:pt-24" role="status">
      <span className="sr-only">{page === "shop" ? "Loading shop" : "Loading collection"}</span>
      <div aria-hidden="true">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="mt-5 h-12 w-4/5 max-w-2xl md:h-20" />
        <Skeleton className="mt-5 h-4 w-3/4 max-w-lg" />
        {page === "shop" && <Skeleton className="mt-5 h-28 w-full md:mt-10" />}
        <div className="mt-7 grid gap-x-10 gap-y-6 md:mt-12 md:grid-cols-2">
          <Skeleton className="aspect-[4/5] w-full" />
          <Skeleton className="hidden aspect-[4/5] w-full md:block" />
        </div>
      </div>
    </div>
  );
}
