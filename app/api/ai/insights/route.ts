const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

const SYSTEM_PROMPTS: Record<string, string> = {
  expenses: '당신은 개인 재무 분석가입니다. 사용자의 지출 데이터를 분석해 소비 패턴과 실용적인 절약 팁을 친근하게 알려주세요. 3~5문장으로 간결하게. 마크다운 문법(**, ##, # 등)을 절대 사용하지 마세요. 각 포인트는 줄바꿈으로 구분해서 읽기 쉽게 작성하세요.',
  sleep: '당신은 수면 전문가입니다. 수면 데이터를 분석해 수면 패턴의 특징과 개선 방법을 친근하게 알려주세요. 3~5문장으로 간결하게. 마크다운 문법(**, ##, # 등)을 절대 사용하지 마세요. 각 포인트는 줄바꿈으로 구분해서 읽기 쉽게 작성하세요.',
  exercise: '당신은 피트니스 트레이너입니다. 운동 데이터를 분석해 운동 패턴의 특징과 동기부여 메시지를 친근하게 알려주세요. 3~5문장으로 간결하게. 마크다운 문법(**, ##, # 등)을 절대 사용하지 마세요. 각 포인트는 줄바꿈으로 구분해서 읽기 쉽게 작성하세요.',
  mood: '당신은 심리 상담사입니다. 기분 데이터를 분석해 감정 패턴의 특징과 긍정적인 인사이트를 친근하게 알려주세요. 3~5문장으로 간결하게. 마크다운 문법(**, ##, # 등)을 절대 사용하지 마세요. 각 포인트는 줄바꿈으로 구분해서 읽기 쉽게 작성하세요.',
  diet: '당신은 영양사입니다. 식단 데이터를 분석해 영양 균형과 식습관 개선 포인트를 친근하게 알려주세요. 3~5문장으로 간결하게. 마크다운 문법(**, ##, # 등)을 절대 사용하지 마세요. 각 포인트는 줄바꿈으로 구분해서 읽기 쉽게 작성하세요.',
  overall: '당신은 개인 라이프스타일 코치입니다. 수면, 기분, 운동, 지출 데이터를 종합 분석해 생활 패턴의 특징과 개선 방향을 친근하게 알려주세요. 4~6문장으로. 마크다운 문법(**, ##, # 등)을 절대 사용하지 마세요. 각 포인트는 줄바꿈으로 구분해서 읽기 쉽게 작성하세요.',
}

export async function POST(request: Request) {
  const { type, data } = await request.json() as { type: string; data: unknown }

  const systemPrompt = SYSTEM_PROMPTS[type] ?? SYSTEM_PROMPTS.overall

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.DAYLOG_ANTHROPIC_KEY ?? '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      stream: true,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `다음은 내 최근 ${type === 'expenses' ? '지출' : type === 'sleep' ? '수면' : type === 'exercise' ? '운동' : type === 'mood' ? '기분' : type === 'diet' ? '식단' : '생활'} 데이터입니다. 분석해주세요.\n\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    return new Response('AI 분석에 실패했습니다.', { status: 500 })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break

          try {
            const parsed = JSON.parse(data) as { type: string; delta?: { type: string; text: string } }
            if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
              controller.enqueue(new TextEncoder().encode(parsed.delta.text))
            }
          } catch {
            // skip malformed lines
          }
        }
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
