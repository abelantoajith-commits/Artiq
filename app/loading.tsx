export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Bar Skeleton */}
      <div className="flex items-center justify-between pb-3 border-b border-line">
        <div className="space-y-1.5">
          <div className="h-6 w-24 bg-surface rounded-lg animate-pulse" />
          <div className="h-3 w-44 bg-surface rounded-md animate-pulse hidden sm:block" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-surface animate-pulse" />
          <div className="w-10 h-10 rounded-xl bg-surface animate-pulse" />
          <div className="w-10 h-10 rounded-xl bg-surface animate-pulse" />
        </div>
      </div>

      {/* Featured Artists Row Skeleton */}
      <div className="space-y-3">
        <div className="h-3 w-28 bg-surface rounded animate-pulse" />
        <div className="flex items-center gap-4 overflow-hidden py-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center flex-shrink-0 space-y-2">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-surface border border-line animate-pulse" />
              <div className="h-3 w-14 bg-surface rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Category Chips Strip Skeleton */}
      <div className="flex items-center gap-2 overflow-hidden py-2">
        {[80, 100, 110, 95, 120, 90].map((width, idx) => (
          <div
            key={idx}
            style={{ width }}
            className="h-9 rounded-full bg-surface border border-line animate-pulse flex-shrink-0"
          />
        ))}
      </div>

      {/* Masonry Cards Skeletons */}
      <div className="columns-2 md:columns-3 xl:columns-4 gap-3 sm:gap-4 w-full">
        {[260, 320, 240, 300, 280, 340].map((height, idx) => (
          <div
            key={idx}
            className="break-inside-avoid mb-3 sm:mb-4 bg-surface border border-line rounded-2xl p-3 space-y-3 animate-pulse"
          >
            <div
              style={{ height }}
              className="w-full bg-canvas rounded-xl"
            />
            <div className="h-4 bg-canvas rounded w-3/4" />
            <div className="h-3 bg-canvas rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

