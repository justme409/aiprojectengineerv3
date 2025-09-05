import { notFound } from 'next/navigation'

interface PageProps {
	params: { projectId: string }
}

// Mock project data - in real implementation, this would be fetched
const getProject = (id: string) => ({
	id,
	name: id === '1' ? 'Highway Construction Project' : 'Bridge Rehabilitation',
	clientName: 'State Government',
	status: 'active',
	progress: 75,
	totalLots: 12,
	completedLots: 9,
	pendingApprovals: 2
})

export default function ClientDashboardPage({ params }: PageProps) {
	const project = getProject(params.projectId)
	if (!project) notFound()

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
						<p className="text-3xl font-bold text-blue-600">{project.progress}%</p>
						<div className="w-full bg-gray-200 rounded-full h-2 mt-2">
							<div
								className="bg-blue-600 h-2 rounded-full"
								style={{ width: `${project.progress}%` }}
							></div>
						</div>
					</div>
					<div className="bg-white p-6 rounded-lg shadow">
						<h3 className="text-lg font-medium mb-2">Total Lots</h3>
						<p className="text-3xl font-bold text-green-600">{project.totalLots}</p>
					</div>
					<div className="bg-white p-6 rounded-lg shadow">
						<h3 className="text-lg font-medium mb-2">Completed Lots</h3>
						<p className="text-3xl font-bold text-green-600">{project.completedLots}</p>
					</div>
					<div className="bg-white p-6 rounded-lg shadow">
						<h3 className="text-lg font-medium mb-2">Pending Approvals</h3>
						<p className="text-3xl font-bold text-orange-600">{project.pendingApprovals}</p>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="bg-white p-6 rounded-lg shadow">
						<h3 className="text-lg font-medium mb-4">Recent Activity</h3>
						<ul className="space-y-2">
							<li className="text-sm text-gray-600">Lot 001 completed and approved</li>
							<li className="text-sm text-gray-600">ITP template updated</li>
							<li className="text-sm text-gray-600">New inspection request submitted</li>
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
