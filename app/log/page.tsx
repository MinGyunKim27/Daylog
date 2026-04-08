export const dynamic = 'force-dynamic'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExpenseForm } from '@/components/log/expense-form'
import { SleepForm } from '@/components/log/sleep-form'
import { ExerciseForm } from '@/components/log/exercise-form'
import { MoodForm } from '@/components/log/mood-form'
import { DietForm } from '@/components/log/diet-form'
import { Navbar } from '@/components/layout/navbar'
import { Header } from '@/components/layout/header'
import { formatDate } from '@/lib/utils'

export default function LogPage() {
  const dateLabel = formatDate(new Date())

  return (
    <div className="min-h-screen pb-20">
      <Header title="오늘의 기록" subtitle={dateLabel} />

      <main className="px-4">
        <Tabs defaultValue="expense" className="w-full">
          <TabsList className="grid grid-cols-5 w-full mb-6 bg-[hsl(var(--card))] h-11">
            <TabsTrigger value="expense" className="text-xs px-1">💰지출</TabsTrigger>
            <TabsTrigger value="sleep" className="text-xs px-1">😴수면</TabsTrigger>
            <TabsTrigger value="exercise" className="text-xs px-1">🏃운동</TabsTrigger>
            <TabsTrigger value="mood" className="text-xs px-1">😊기분</TabsTrigger>
            <TabsTrigger value="diet" className="text-xs px-1">🍽식단</TabsTrigger>
          </TabsList>

          <TabsContent value="expense"><ExpenseForm /></TabsContent>
          <TabsContent value="sleep"><SleepForm /></TabsContent>
          <TabsContent value="exercise"><ExerciseForm /></TabsContent>
          <TabsContent value="mood"><MoodForm /></TabsContent>
          <TabsContent value="diet"><DietForm /></TabsContent>
        </Tabs>
      </main>

      <Navbar />
    </div>
  )
}
