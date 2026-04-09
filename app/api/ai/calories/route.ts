import { NextResponse } from 'next/server'

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

interface CaloriesRequest {
  breakfast: string
  lunch: string
  dinner: string
  snacks: string[]
}

interface CaloriesResponse {
  breakfast: number | null
  lunch: number | null
  dinner: number | null
  snacks: number[]
}

export async function POST(request: Request) {
  const body = (await request.json()) as CaloriesRequest
  const { breakfast, lunch, dinner, snacks } = body

  const hasAnyMeal = breakfast || lunch || dinner || snacks.length > 0
  if (!hasAnyMeal) {
    return NextResponse.json({ error: '입력된 식단이 없습니다.' }, { status: 400 })
  }

  const mealLines = [
    breakfast && `Breakfast: ${breakfast}`,
    lunch && `Lunch: ${lunch}`,
    dinner && `Dinner: ${dinner}`,
    snacks.length > 0 && `Snacks: ${snacks.join(', ')}`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.DAYLOG_ANTHROPIC_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        messages: [
          {
            role: 'user',
            content: `Estimate kcal for each Korean meal below (1 adult portion). Output ONLY JSON, no explanation.

${mealLines}

JSON format: {"breakfast": 650, "lunch": 900, "dinner": 400, "snacks": [250]}
Rules: integer kcal values. null only if not listed above. snacks = empty array if none.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('[calories] API error:', response.status, err)
      return NextResponse.json({ error: '칼로리 추정에 실패했습니다.' }, { status: 500 })
    }

    const data = await response.json() as { content: Array<{ type: string; text: string }> }
    const text = data.content[0]?.type === 'text' ? data.content[0].text : ''

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[calories] No JSON in response:', text)
      return NextResponse.json({ error: '칼로리 추정에 실패했습니다.' }, { status: 500 })
    }

    const result = JSON.parse(jsonMatch[0]) as CaloriesResponse
    return NextResponse.json(result)
  } catch (error) {
    console.error('[calories] Error:', error)
    return NextResponse.json({ error: '칼로리 추정에 실패했습니다.' }, { status: 500 })
  }
}
