import { NextRequest } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
	const projectId = new URL(req.url).searchParams.get('project_id')
	const reportType = new URL(req.url).searchParams.get('type') || 'summary'

	if (!projectId) return new Response('project_id required', { status: 400 })

	switch (reportType) {
		case 'summary':
			return Response.json(await generateProjectSummary(projectId))
		case 'quality':
			return Response.json(await generateQualityReport(projectId))
		case 'inspections':
			return Response.json(await generateInspectionReport(projectId))
		case 'tests':
			return Response.json(await generateTestReport(projectId))
		case 'hse':
			return Response.json(await generateHSEReport(projectId))
		case 'field':
			return Response.json(await generateFieldReport(projectId))
		default:
			return new Response('Invalid report type', { status: 400 })
	}
}

async function generateProjectSummary(projectId: string) {
	const project = await query('SELECT * FROM public.projects WHERE id=$1', [projectId])
	if (project.rows.length === 0) throw new Error('Project not found')

	const [
		assets,
		inspections,
		tests,
		hseIncidents,
		fieldAssets
	] = await Promise.all([
		query('SELECT COUNT(*) as count FROM public.assets WHERE project_id=$1 AND is_current AND NOT is_deleted', [projectId]),
		query('SELECT COUNT(*) as count FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted', [projectId, 'inspection_request']),
		query('SELECT COUNT(*) as count FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted', [projectId, 'test_request']),
		query('SELECT COUNT(*) as count FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted', [projectId, 'incident']),
		query('SELECT COUNT(*) as count FROM public.assets WHERE project_id=$1 AND type IN ($2, $3, $4) AND is_current AND NOT is_deleted', [projectId, 'daily_diary', 'site_instruction', 'timesheet'])
	])

	return {
		project: project.rows[0],
		summary: {
			total_assets: parseInt(assets.rows[0].count),
			inspections: parseInt(inspections.rows[0].count),
			tests: parseInt(tests.rows[0].count),
			hse_incidents: parseInt(hseIncidents.rows[0].count),
			field_records: parseInt(fieldAssets.rows[0].count)
		}
	}
}

async function generateQualityReport(projectId: string) {
	const [
		workLots,
		inspectionPoints,
		testResults,
		ncrs,
		itpDocuments
	] = await Promise.all([
		query('SELECT * FROM public.work_lot_register WHERE project_id=$1', [projectId]),
		query('SELECT * FROM public.hold_witness_register WHERE project_id=$1', [projectId]),
		query('SELECT COUNT(*) as count, content->>\'pass_fail\' as result FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted GROUP BY content->>\'pass_fail\'', [projectId, 'test_result']),
		query('SELECT COUNT(*) as count FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted', [projectId, 'ncr']),
		query('SELECT COUNT(*) as count FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted', [projectId, 'itp_document'])
	])

	const testPassFail = testResults.rows.reduce((acc: any, row: any) => {
		acc[row.result || 'unknown'] = parseInt(row.count)
		return acc
	}, {})

	return {
		work_lots: workLots.rows,
		inspection_points: inspectionPoints.rows,
		test_results_summary: testPassFail,
		ncrs_count: parseInt(ncrs.rows[0]?.count || 0),
		itp_documents_count: parseInt(itpDocuments.rows[0]?.count || 0)
	}
}

async function generateInspectionReport(projectId: string) {
	const [
		inspections,
		scheduled,
		completed,
		overdue
	] = await Promise.all([
		query('SELECT COUNT(*) as count FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted', [projectId, 'inspection_request']),
		query('SELECT COUNT(*) as count FROM public.assets WHERE project_id=$1 AND type=$2 AND content->>\'scheduled_at\' IS NOT NULL AND is_current AND NOT is_deleted', [projectId, 'inspection_request']),
		query('SELECT COUNT(*) as count FROM public.assets WHERE project_id=$1 AND type=$2 AND approval_state=$3 AND is_current AND NOT is_deleted', [projectId, 'inspection_request', 'approved']),
		query('SELECT COUNT(*) as count FROM public.assets WHERE project_id=$1 AND type=$2 AND content->>\'sla_due_at\' < NOW()::text AND approval_state != $3 AND is_current AND NOT is_deleted', [projectId, 'inspection_request', 'approved'])
	])

	return {
		total: parseInt(inspections.rows[0].count),
		scheduled: parseInt(scheduled.rows[0].count),
		completed: parseInt(completed.rows[0].count),
		overdue: parseInt(overdue.rows[0].count)
	}
}

async function generateTestReport(projectId: string) {
	const [
		testRequests,
		testResults,
		samples,
		passRate
	] = await Promise.all([
		query('SELECT COUNT(*) as count FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted', [projectId, 'test_request']),
		query('SELECT COUNT(*) as count FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted', [projectId, 'test_result']),
		query('SELECT COUNT(*) as count FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted', [projectId, 'sample']),
		query('SELECT ROUND(AVG(CASE WHEN content->>\'pass_fail\' = \'pass\' THEN 1 ELSE 0 END) * 100, 2) as rate FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted', [projectId, 'test_result'])
	])

	return {
		test_requests: parseInt(testRequests.rows[0].count),
		test_results: parseInt(testResults.rows[0].count),
		samples: parseInt(samples.rows[0].count),
		pass_rate: parseFloat(passRate.rows[0].rate || 0)
	}
}

async function generateHSEReport(projectId: string) {
	const [
		incidents,
		swms,
		permits,
		toolboxTalks,
		safetyWalks
	] = await Promise.all([
		query('SELECT COUNT(*) as count FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted', [projectId, 'incident']),
		query('SELECT COUNT(*) as count FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted', [projectId, 'swms']),
		query('SELECT COUNT(*) as count FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted', [projectId, 'permit']),
		query('SELECT COUNT(*) as count FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted', [projectId, 'toolbox_talk']),
		query('SELECT COUNT(*) as count FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted', [projectId, 'safety_walk'])
	])

	return {
		incidents: parseInt(incidents.rows[0].count),
		swms: parseInt(swms.rows[0].count),
		permits: parseInt(permits.rows[0].count),
		toolbox_talks: parseInt(toolboxTalks.rows[0].count),
		safety_walks: parseInt(safetyWalks.rows[0].count)
	}
}

async function generateFieldReport(projectId: string) {
	const [
		dailyDiaries,
		siteInstructions,
		timesheets,
		plantRecords
	] = await Promise.all([
		query('SELECT COUNT(*) as count FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted', [projectId, 'daily_diary']),
		query('SELECT COUNT(*) as count FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted', [projectId, 'site_instruction']),
		query('SELECT COUNT(*) as count FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted', [projectId, 'timesheet']),
		query('SELECT COUNT(*) as count FROM public.assets WHERE project_id=$1 AND type IN ($2, $3, $4) AND is_current AND NOT is_deleted', [projectId, 'plant_prestart', 'maintenance_record', 'utilization_log'])
	])

	return {
		daily_diaries: parseInt(dailyDiaries.rows[0].count),
		site_instructions: parseInt(siteInstructions.rows[0].count),
		timesheets: parseInt(timesheets.rows[0].count),
		plant_records: parseInt(plantRecords.rows[0].count)
	}
}
