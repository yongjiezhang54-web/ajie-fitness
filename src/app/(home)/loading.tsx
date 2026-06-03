// Skeleton loader for the home page
export default function Loading() {
  return (
    <main className="mx-auto max-w-md px-4 pb-20 pt-6">
      <div className="mb-6">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-7 w-24 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="mb-6 h-32 animate-pulse rounded-2xl bg-gradient-to-r from-emerald-200 to-teal-200" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    </main>
  );
}
