export default function FinanceLoading() {
  return (
    <div className="min-h-screen pb-24 md:pb-12 px-6 py-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 animate-pulse h-24" />
          ))}
        </div>
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 animate-pulse h-64" />
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 animate-pulse h-48" />
      </div>
    </div>
  )
}
