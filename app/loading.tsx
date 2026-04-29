export default function RootLoading() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--bg-void)]">
      <div className="flex w-full max-w-[320px] flex-col gap-6">
        <div className="skeleton h-5 w-1/3" />
        <div className="skeleton h-12 w-full" />
        <div className="skeleton h-4 w-2/3" />
        <div className="mt-4 space-y-3">
          <div className="skeleton h-24 w-full" />
          <div className="skeleton h-24 w-full" />
          <div className="skeleton h-24 w-full" />
        </div>
      </div>
    </div>
  );
}
