'use client'

import { useState } from 'react'
import { Sparkles, Loader2, ChevronDown } from 'lucide-react'

interface Props {
  type: string
  data: unknown
  accentColor?: string
}

export function AiInsightPanel({ type, data, accentColor = '#818CF8' }: Props) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleStart() {
    setStarted(true)
    setLoading(true)
    setText('')
    setError(null)

    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data }),
      })

      if (!response.ok || !response.body) {
        setError('AI 분석에 실패했습니다. 다시 시도해 주세요.')
        setLoading(false)
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setText((prev) => prev + chunk)
      }
    } catch {
      setError('AI 분석 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={15} style={{ color: accentColor }} />
          <h2 className="text-sm font-semibold">AI 분석</h2>
        </div>
        {!started && (
          <button
            onClick={() => void handleStart()}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition-opacity hover:opacity-80"
            style={{ borderColor: `${accentColor}50`, backgroundColor: `${accentColor}15`, color: accentColor }}
          >
            <Sparkles size={12} />
            분석 시작
          </button>
        )}
        {started && !loading && text && (
          <button
            onClick={() => void handleStart()}
            className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            다시 분석
          </button>
        )}
      </div>

      {!started && (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          AI가 데이터를 분석해 패턴과 인사이트를 알려드려요.
        </p>
      )}

      {loading && !text && (
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
          <Loader2 size={14} className="animate-spin" />
          분석 중...
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
      )}

      {text && (
        <div className="space-y-2">
          {text.split('\n').filter((line) => line.trim()).map((line, i) => (
            <p key={i} className="text-sm leading-relaxed text-[hsl(var(--foreground))]">
              {line}
            </p>
          ))}
          {loading && (
            <span className="inline-block w-1 h-4 bg-current animate-pulse" />
          )}
        </div>
      )}
    </div>
  )
}
