import { auth } from '@/lib/auth'
import { getProjectById } from '@/lib/actions/project-actions'
import { query } from '@/lib/db'
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

  // Fetch ITP templates for the project from asset_heads; treat both 'itp_template' and 'itp_document' as templates
  const { rows } = await query(
    `SELECT id, name, status, content, document_number
     FROM public.asset_heads
     WHERE project_id = $1 AND type IN ('itp_template','itp_document')
     ORDER BY updated_at DESC`,
    [projectId]
  )
  const templates = rows.map((t: any) => ({
    id: t.id,
    name: t.name,
    version: t.content?.version || null,
    status: t.status,
    document_number: t.document_number || null,
  }))

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Inspection and Test Plan Templates</h1>
      <ItpTemplateListClient templates={templates} projectId={projectId} />
    </div>
  )
}

export const revalidate = 0
