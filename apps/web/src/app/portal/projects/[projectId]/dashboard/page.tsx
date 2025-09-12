import { notFound } from 'next/navigation'
import { getProjectById } from '@/lib/actions/project-actions'
import { getAssets } from '@/lib/actions/asset-actions'

interface PageProps {
	params: Promise<{ projectId: string }>
}

async function getProjectMetrics(projectId: string) {
	const project = await getProjectById(projectId)
	if (!project) return null

	// Get all assets for this project
	const assets = await getAssets({ project_id: projectId })

	// Calculate metrics
	const lots = assets.filter(asset => asset.type === 'lot')
	const totalLots = lots.length
	const completedLots = lots.filter(lot => lot.status === 'completed').length
	const activeLots = lots.filter(lot => lot.status === 'active').length

	// Calculate progress based on completed vs total lots
	const progress = totalLots > 0 ? Math.round((completedLots / totalLots) * 100) : 0

	// Get pending approvals (assets with approval_state = 'pending_review')
	const pendingApprovals = assets.filter(asset => asset.approval_state === 'pending_review').length

	// Get recent activity (last 5 assets)
	const recentActivity = assets
		.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
		.slice(0, 5)
		.map(asset => ({
			id: asset.id,
			name: asset.name,
			type: asset.type,
			created_at: asset.created_at
		}))

	return {
		project,
		metrics: {
			totalLots,
			completedLots,
			activeLots,
			progress,
			pendingApprovals,
			recentActivity
		}
	}
}

export default async function ClientDashboardPage({ params }: PageProps) {
	const { projectId } = await params
	const data = await getProjectMetrics(projectId)
	if (!data) notFound()

	const { project, metrics } = data

	return (
		<main className="min-h-screen bg-gray-50 p-6">
			<div className="max-w-4xl mx-auto">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">{project.name}</h1>
					<p className="text-gray-600">Client Dashboard</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<div className="bg-white p-6 rounded-lg shadow">
						<h3 className="text-lg font-medium mb-2">Project Progress</h3>
						<p className="text-3xl font-bold text-primary">{metrics.progress}%</p>
						<div className="w-full bg-gray-200 rounded-full h-2 mt-2">
							<div
								className="bg-primary h-2 rounded-full"
								style={{ width: `${metrics.progress}%` }}
							></div>
						</div>
					</div>
					<div className="bg-white p-6 rounded-lg shadow">
						<h3 className="text-lg font-medium mb-2">Total Lots</h3>
						<p className="text-3xl font-bold text-green-600">{metrics.totalLots}</p>
					</div>
					<div className="bg-white p-6 rounded-lg shadow">
						<h3 className="text-lg font-medium mb-2">Completed Lots</h3>
						<p className="text-3xl font-bold text-green-600">{metrics.completedLots}</p>
					</div>
					<div className="bg-white p-6 rounded-lg shadow">
						<h3 className="text-lg font-medium mb-2">Pending Approvals</h3>
						<p className="text-3xl font-bold text-orange-600">{metrics.pendingApprovals}</p>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="bg-white p-6 rounded-lg shadow">
						<h3 className="text-lg font-medium mb-4">Recent Activity</h3>
						<ul className="space-y-2">
							{metrics.recentActivity.length > 0 ? (
								metrics.recentActivity.map((activity) => (
									<li key={activity.id} className="text-sm text-gray-600">
										{activity.name} ({activity.type}) - {new Date(activity.created_at).toLocaleDateString()}
									</li>
								))
							) : (
								<li className="text-sm text-gray-600">No recent activity</li>
							)}
						</ul>
					</div>
					<div className="bg-white p-6 rounded-lg shadow">
						<h3 className="text-lg font-medium mb-4">Quick Actions</h3>
						<div className="space-y-2">
							<button className="w-full text-left p-2 bg-gray-100 rounded hover:bg-gray-200">
								View Documents
							</button>
							<button className="w-full text-left p-2 bg-gray-100 rounded hover:bg-gray-200">
								Check Approvals
							</button>
							<button className="w-full text-left p-2 bg-gray-100 rounded hover:bg-gray-200">
								View Reports
							</button>
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}
