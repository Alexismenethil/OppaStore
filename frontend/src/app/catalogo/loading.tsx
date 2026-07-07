export default function CatalogoLoading() {
  return (
    <main className="mx-auto mt-16 min-h-[60vh] max-w-container-max px-margin-mobile pb-lg md:mt-20 md:px-gutter">
      <header className="py-md md:py-lg">
        <div className="skeleton h-10 w-44" />
        <div className="skeleton mt-xs h-5 w-full max-w-md" />
      </header>
      <div className="sticky top-16 z-30 -mx-margin-mobile bg-background/85 px-margin-mobile py-sm backdrop-blur-md md:top-20 md:mx-0 md:px-0">
        <div className="space-y-md">
          <div className="skeleton h-12 w-full max-w-md rounded-full" />
          <div className="flex gap-sm overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-10 w-28 shrink-0 rounded-full" />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-md grid grid-cols-2 gap-sm sm:gap-md lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-64 sm:h-72" />
        ))}
      </div>
    </main>
  );
}
