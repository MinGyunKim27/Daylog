import { AppShell } from '@/components/layout/app-shell'

export default function SettingsLoading() {
  return (
    <AppShell>
      <div className="min-h-screen pb-24 md:pb-12 animate-pulse">
        <div className="px-6 py-6 w-full max-w-2xl mx-auto space-y-5">
          <div className="h-20 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]" />
          <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-5 space-y-4">
            <div className="h-4 w-12 bg-[hsl(var(--muted))] rounded" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-10 bg-[hsl(var(--muted))] rounded-xl" />
              <div className="h-10 bg-[hsl(var(--muted))] rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-14 bg-[hsl(var(--muted))] rounded-xl" />
              <div className="h-14 bg-[hsl(var(--muted))] rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-14 bg-[hsl(var(--muted))] rounded-xl" />
              <div className="h-14 bg-[hsl(var(--muted))] rounded-xl" />
            </div>
            <div className="h-4 w-12 bg-[hsl(var(--muted))] rounded" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-[hsl(var(--muted))] rounded-xl" />
              ))}
            </div>
            <div className="h-16 bg-[hsl(var(--muted))] rounded-xl" />
            <div className="h-12 bg-[hsl(var(--muted))] rounded-xl" />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
