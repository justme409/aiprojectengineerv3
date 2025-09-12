import { Suspense } from 'react'
import QseDocViewer from '@/components/features/qse/QseDocViewer'

export default function CompetencePage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading...</div>}>
        <QseDocViewer docPath="corp-competence" />
      </Suspense>
    </div>
  )
}
