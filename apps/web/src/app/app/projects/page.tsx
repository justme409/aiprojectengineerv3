import { Suspense } from 'react'
import ProjectList from '@/components/features/project/ProjectList'

export default function ProjectsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-muted-foreground">Manage your construction projects</p>
      </div>
      <Suspense fallback={<div>Loading projects...</div>}>
        <ProjectList />
      </Suspense>
    </div>
  )
}
