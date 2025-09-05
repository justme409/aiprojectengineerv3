import { notFound } from 'next/navigation'
import { getProjectById } from '@/lib/actions/project-actions'
import { getAssets } from '@/lib/actions/asset-actions'

interface PageProps {
	params: { projectId: string }
}

export default async function ProjectOverviewPage({ params }: PageProps) {
	const project = await getProjectById(params.projectId)
	if (!project) notFound()

	const assets = await getAssets({ project_id: params.projectId, limit: 10 })

	return (
		<main className="p-6">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">{project.name}</h1>
				<p className="text-gray-600">{project.description}</p>
				<div className="mt-4 text-sm text-gray-500">
					<p>Client: {project.clientName}</p>
					<p>Location: {project.location}</p>
					<p>Status: {project.status}</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 rounded-lg shadow">
					<h3 className="text-lg font-medium mb-2">Total Assets</h3>
					<p className="text-3xl font-bold text-blue-600">{assets.length}</p>
				</div>
				<div className="bg-white p-6 rounded-lg shadow">
					<h3 className="text-lg font-medium mb-2">Documents</h3>
					<p className="text-3xl font-bold text-green-600">
						{assets.filter(a => a.type === 'document').length}
					</p>
				</div>
				<div className="bg-white p-6 rounded-lg shadow">
					<h3 className="text-lg font-medium mb-2">Active Lots</h3>
					<p className="text-3xl font-bold text-orange-600">
						{assets.filter(a => a.type === 'lot' && a.status === 'active').length}
					</p>
				</div>
			</div>

			<div className="mt-8">
				<h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
				<div className="space-y-2">
					{assets.slice(0, 5).map((asset: any) => (
						<div key={asset.id} className="bg-white p-4 rounded border">
							<div className="flex justify-between">
								<span className="font-medium">{asset.name}</span>
								<span className="text-sm text-gray-500">{asset.type}</span>
							</div>
							<div className="text-sm text-gray-600 mt-1">
								{new Date(asset.createdAt).toLocaleDateString()}
							</div>
						</div>
					))}
				</div>
			</div>
		</main>
	)
}
