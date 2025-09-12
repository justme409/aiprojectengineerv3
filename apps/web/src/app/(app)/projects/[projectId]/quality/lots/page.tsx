import { notFound } from 'next/navigation'
import { getProjectById } from '@/lib/actions/project-actions'
import { query } from '@/lib/db'
import WorkLotRegister from '@/components/features/quality/WorkLotRegister'

interface PageProps {
	params: Promise<{ projectId: string }>
}

export default async function WorkLotsPage({ params }: PageProps) {
	const { projectId } = await params
	const project = await getProjectById(projectId)
	if (!project) notFound()

	// Get work lot register data from view
	const { rows } = await query('SELECT * FROM public.work_lot_register WHERE project_id=$1 ORDER BY lot_number', [projectId])

	return (
		<main className="p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">{project.name} - Work Lot Register</h1>
				<p className="text-gray-600">Quality management work lots with HP/WP tracking</p>
			</div>

			<WorkLotRegister projectId={projectId} />
		</main>
	)
}
