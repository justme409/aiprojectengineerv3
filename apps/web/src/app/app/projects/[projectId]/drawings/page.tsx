import { notFound } from 'next/navigation'
import { getProjectById } from '@/lib/actions/project-actions'
import DrawingBrowser from '@/components/features/drawing/DrawingBrowser'
import DrawingUpload from '@/components/features/drawing/DrawingUpload'

interface PageProps {
	params: Promise<{ projectId: string }>
}

export default async function ProjectDrawingsPage({ params }: PageProps) {
	const { projectId } = await params
	const project = await getProjectById(projectId)
	if (!project) notFound()

	return (
		<main className="p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">{project.name} - Drawings</h1>
				<p className="text-gray-600">Upload and manage project drawings with revision tracking</p>
			</div>

			<div className="mb-8">
				<DrawingUpload projectId={projectId} />
			</div>

			<div>
				<h2 className="text-xl font-semibold mb-4">Drawing Library</h2>
				<DrawingBrowser projectId={projectId} />
			</div>
		</main>
	)
}
