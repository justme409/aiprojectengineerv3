import { auth } from '@/lib/auth'
import { getProjectById } from '@/lib/actions/project-actions'
import { getItpTemplatesForProject } from '@/lib/actions/lot-actions'
import ItpTemplateListClient from '@/components/features/project/ItpTemplateListClient'

type ItpTemplatesPageProps = {
  params: Promise<{
    projectId: string
  }>
}

export default async function ItpTemplatesPage({ params }: ItpTemplatesPageProps) {
  const { projectId } = await params
  const session = await auth()

  if (!session?.user) {
    throw new Error('Authentication required')
  }

  // Check if user has access to this project
  const project = await getProjectById(projectId)
  if (!project) {
    throw new Error('Project not found')
  }

  // Simple auth check - user must be the project creator
  if (project.created_by_user_id !== session.user.id) {
    throw new Error('Access denied')
  }

  // Fetch ITP templates for the project
  const templatesResult = await getItpTemplatesForProject(projectId)
  if (!templatesResult.success || !templatesResult.data) {
    throw new Error('Failed to fetch ITP templates')
  }

  const templates = templatesResult.data!.map((template: any) => ({
    id: template.id,
    name: template.name,
    version: template.content?.version || null,
    status: template.status,
  }))

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Inspection and Test Plan Templates</h1>
      <ItpTemplateListClient templates={templates} projectId={projectId} />
    </div>
  )
}

export const revalidate = 0
