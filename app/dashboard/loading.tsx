export default function DashboardLoading() {
  return (
    <div className="min-h-screen pb-12 animate-pulse">
      <div className="px-6 py-4 border-b border-[hsl(var(--border))]">
        <div className="h-3 w-8 bg-[hsl(var(--muted))] rounded mb-2" />
        <div className="h-6 w-40 bg-[hsl(var(--muted))] rounded" />
      </div>
      <div className="px-6 py-6 w-full max-w-5xl mx-auto space-y-5">
        {/* 체크리스트 스켈레톤 */}
        <div className="h-24 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]" />
        {/* 요약 카드 스켈레톤 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]" />
          ))}
        </div>
        {/* 차트 스켈레톤 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]" />
          ))}
        </div>
      </div>
    </div>
  )
}
