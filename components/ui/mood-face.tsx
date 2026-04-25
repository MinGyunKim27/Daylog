interface Props {
  score: number  // 1-10
  size?: number
}

function moodColor(score: number) {
  if (score >= 9) return '#818CF8'
  if (score >= 7) return '#34D399'
  if (score >= 4) return '#FBBF24'
  return '#F87171'
}

function mouthPath(score: number) {
  // 1-3: frown / 4-6: neutral / 7-10: smile
  if (score <= 3) return 'M 33,60 Q 50,46 67,60'
  if (score <= 6) return 'M 33,54 Q 50,54 67,54'
  return 'M 33,50 Q 50,65 67,50'
}

export function MoodFace({ score, size = 64 }: Props) {
  const color = moodColor(score)

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 배경 원 */}
      <circle cx="50" cy="50" r="46" fill={color} fillOpacity="0.15" />
      <circle cx="50" cy="50" r="46" stroke={color} strokeWidth="2.5" />
      {/* 눈 */}
      <circle cx="34" cy="40" r="4.5" fill={color} />
      <circle cx="66" cy="40" r="4.5" fill={color} />
      {/* 입 */}
      <path
        d={mouthPath(score)}
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
