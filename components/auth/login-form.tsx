'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const supabase = createClient()
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/api/auth/callback` },
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('이메일을 확인해 가입을 완료해 주세요.')
      }

      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('이메일 또는 비밀번호를 확인해 주세요.')
      setLoading(false)
      return
    }

    router.push('/today')
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="text-5xl mb-3">📘</div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Daylog</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1 text-sm">개인 생활 데이터 트래커</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="hello@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="bg-[hsl(var(--card))] border-[hsl(var(--border))]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="bg-[hsl(var(--card))] border-[hsl(var(--border))]"
            />
          </div>

          {error ? <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">{error}</p> : null}
          {message ? <p className="text-green-400 text-sm bg-green-400/10 rounded-lg px-3 py-2">{message}</p> : null}

          <Button type="submit" className="w-full bg-[hsl(var(--primary))] hover:opacity-90" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSignUp ? '가입하기' : '로그인'}
          </Button>
        </form>

        <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
          {isSignUp ? '이미 계정이 있나요?' : '계정이 없나요?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp((prev) => !prev)
              setError(null)
              setMessage(null)
            }}
            className="text-[hsl(var(--primary))] hover:underline font-medium"
          >
            {isSignUp ? '로그인' : '가입하기'}
          </button>
        </p>
      </div>
    </div>
  )
}
