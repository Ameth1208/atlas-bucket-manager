'use client';

export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div key={i} className="h-32 rounded-lg bg-secondary animate-pulse" />
      ))}
    </div>
  );
}
