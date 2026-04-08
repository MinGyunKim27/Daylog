'use client'

import { AppProgressBar } from 'next-nprogress-bar'

export function ProgressBar() {
  return (
    <AppProgressBar
      height="2px"
      color="hsl(263.4, 70%, 60%)"
      options={{ showSpinner: false }}
      shallowRouting
    />
  )
}
