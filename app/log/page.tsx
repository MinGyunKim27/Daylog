export const dynamic = 'force-dynamic'

import { AppShell } from '@/components/layout/app-shell'
import { LogContainer } from '@/components/log/log-container'

export default function LogPage() {
  return (
    <AppShell>
      <div className="min-h-screen pb-24 md:pb-12">
        <div className="px-6 py-6 w-full max-w-5xl mx-auto">
          <LogContainer />
        </div>
      </div>
    </AppShell>
  )
}
