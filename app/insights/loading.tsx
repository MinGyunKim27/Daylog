export default function InsightsLoading() {
  return (
    <div className="min-h-screen pb-12 animate-pulse">
      <div className="px-6 py-6 w-full max-w-2xl mx-auto space-y-3">
        <div className="h-14 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]" />
        ))}
      </div>
    </div>
  )
}
