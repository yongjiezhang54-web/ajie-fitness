export default function Loading() {
  return (
    <main className="mx-auto max-w-md px-4 pb-20 pt-6">
      <div className="mb-6 h-7 w-16 animate-pulse rounded bg-gray-200" />
      <div className="mb-6 h-24 animate-pulse rounded-2xl bg-gray-100" />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    </main>
  );
}
