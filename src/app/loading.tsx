export default function Loading() {
  return (
    <div className="mx-auto flex max-w-md items-center justify-center px-4 pt-20">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-500" />
        <p className="text-sm text-gray-400">加载中...</p>
      </div>
    </div>
  );
}
