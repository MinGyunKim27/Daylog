export default function LogLoading() {
  return (
    <div className="min-h-screen pb-12 animate-pulse">
      <div className="px-6 py-6 w-full max-w-5xl mx-auto">
        <div className="h-14 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] mb-5" />
        <div className="h-11 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]" />
            ))}
          </div>
          <div className="hidden lg:block h-48 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]" />
        </div>
      </div>
    </div>
  )
}
