import { Suspense } from 'react'

interface Props {
  params: Promise<{ projectId: string }>
}

export default async function WbsPage({ params }: Props) {
  const { projectId } = await params
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Wbs</h1>
      <p className="text-muted-foreground">This page is under construction.</p>
      <Suspense fallback={<div>Loading...</div>}>
        <div>Project ID: {projectId}</div>
      </Suspense>
    </div>
  )
}
