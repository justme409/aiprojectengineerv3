import { Suspense } from 'react'
import QseDocViewer from '@/components/features/qse/QseDocViewer'

export default function MonitoringPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading...</div>}>
        <QseDocViewer docPath="corp-monitoring" />
      </Suspense>
    </div>
  )
}
