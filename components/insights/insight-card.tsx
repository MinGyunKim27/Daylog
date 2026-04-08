import { InsightItem } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  insight: InsightItem
}

const typeStyles = {
  positive: 'border-emerald-500/30 bg-emerald-500/5',
  neutral: 'border-blue-500/30 bg-blue-500/5',
  tip: 'border-yellow-500/30 bg-yellow-500/5',
}

const titleColors = {
  positive: 'text-emerald-400',
  neutral: 'text-blue-400',
  tip: 'text-yellow-400',
}

export function InsightCard({ insight }: Props) {
  return (
    <div className={cn(
      'rounded-2xl border p-4 space-y-1.5',
      typeStyles[insight.type]
    )}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{insight.icon}</span>
        <h3 className={cn('text-sm font-semibold', titleColors[insight.type])}>
          {insight.title}
        </h3>
      </div>
      <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed">{insight.text}</p>
    </div>
  )
}
