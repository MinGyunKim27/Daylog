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
  breakfast_reason: string | null
  lunch: number | null
  lunch_reason: string | null
  dinner: number | null
  dinner_reason: string | null
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
            content: `You are a Korean nutrition expert. Estimate total kcal for each meal listed below. Be realistic and accurate — do NOT underestimate.

Key references:
- 순살치킨 1마리 ≈ 1800~2200 kcal (후라이드 기준)
- 삼겹살 1인분(200g) ≈ 600 kcal
- 백반(밥+국+반찬) ≈ 700~900 kcal
- 돈가스 ≈ 700~900 kcal
- 김볶밥 1인분 ≈ 600~800 kcal
- Count ALL items mentioned (수량 포함). "두마리", "2마리" = ×2.

Meals:
${mealLines}

Output ONLY valid JSON, no explanation.
Format: {"breakfast": 650, "breakfast_reason": "김볶밥 600 + 떡갈비 2개 220", "lunch": 900, "lunch_reason": "...", "dinner": 1800, "dinner_reason": "순살치킨 1마리 1900 × 2마리", "snacks": [250]}
Rules: integer kcal. null only if meal not listed. snacks = [] if none. reason = short Korean string explaining the breakdown.`,
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
