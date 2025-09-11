import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getProjectById } from '@/lib/actions/project-actions'
import { getItpTemplateById } from '@/lib/actions/lot-actions'
import ItpTemplateDetailClient from '@/components/features/itp/ItpTemplateDetailClient'

type ItpTemplateDetailPageProps = {
  params: Promise<{
    projectId: string
    templateId: string
  }>
}

export default async function ItpTemplateDetailPage({ params }: ItpTemplateDetailPageProps) {
  const { projectId, templateId } = await params
  const session = await auth()

  if (!session?.user) {
    redirect(`/auth/login?message=auth_required&redirectTo=/app/projects/${projectId}/quality/itp-templates/${templateId}`)
  }

  // Check if user has access to this project
  const project = await getProjectById(projectId)
  if (!project) {
    notFound()
  }

  // Simple auth check - user must be the project creator
  if (project.created_by_user_id !== session.user.id) {
    notFound()
  }

  // Fetch ITP template details
  const templateResult = await getItpTemplateById(templateId)
  if (!templateResult.success || !templateResult.data) {
    notFound()
  }

  const templateAsset = templateResult.data

  // Check if template belongs to this project
  if (templateAsset.project_id !== projectId) {
    notFound()
  }

  const template = {
    id: templateAsset.id,
    name: templateAsset.name,
    description: templateAsset.content?.description,
    version: templateAsset.content?.version || '1.0',
    status: templateAsset.status,
    items: templateAsset.content?.items || [],
    applicabilityNotes: templateAsset.content?.applicability_notes,
    createdAt: templateAsset.created_at,
    updatedAt: templateAsset.updated_at
  }

  return (
    <ItpTemplateDetailClient
      template={template}
      projectId={projectId}
      templateId={templateId}
      projectName={project.name}
      isClientPortal={false}
    />
  )
}

export const revalidate = 0
