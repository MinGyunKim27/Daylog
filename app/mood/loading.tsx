import { AppShell } from '@/components/layout/app-shell'

export default function MoodLoading() {
  return (
    <AppShell>
      <div className="min-h-screen pb-24 md:pb-12 px-6 py-6 animate-pulse">
        <div className="max-w-5xl mx-auto space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]" />
            ))}
          </div>
          <div className="h-16 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]" />
          <div className="h-64 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]" />
          <div className="h-24 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]" />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
