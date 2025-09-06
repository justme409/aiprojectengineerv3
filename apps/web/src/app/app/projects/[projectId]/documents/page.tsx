import { notFound } from 'next/navigation'
import { getProjectById } from '@/lib/actions/project-actions'
import DocumentList from '@/components/features/document/DocumentList'
import DocumentUpload from '@/components/features/document/DocumentUpload'

interface PageProps {
	params: Promise<{ projectId: string }>
}

export default async function ProjectDocumentsPage({ params }: PageProps) {
	const { projectId } = await params
	const project = await getProjectById(projectId)
	if (!project) notFound()

	return (
		<main className="p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">{project.name} - Documents</h1>
				<p className="text-gray-600">Upload and manage project documents</p>
			</div>

			<div className="mb-8">
				<DocumentUpload projectId={projectId} />
			</div>

			<div>
				<h2 className="text-xl font-semibold mb-4">Document Library</h2>
				<DocumentList projectId={projectId} />
			</div>
		</main>
	)
}
