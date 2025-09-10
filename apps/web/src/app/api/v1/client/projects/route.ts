import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Get projects where the user is associated as a client
    // This could be through organization membership or specific client roles
    const result = await pool.query(`
      SELECT p.*,
             o.name as organization_name,
             ou.role_id,
             r.name as role_name
      FROM public.projects p
      JOIN public.organizations o ON o.id = p.organization_id
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id
      JOIN public.roles r ON r.id = ou.role_id
      WHERE ou.user_id = $1
        AND r.name IN ('client', 'client_admin', 'project_client')
        AND p.status IN ('active', 'completed')
      ORDER BY p.updated_at DESC
    `, [userId])

    // Get additional project metrics for each project
    const projectsWithMetrics = await Promise.all(
      result.rows.map(async (project) => {
        // Get project statistics
        const statsResult = await pool.query(`
          SELECT
            COUNT(CASE WHEN type = 'lot' THEN 1 END) as total_lots,
            COUNT(CASE WHEN type = 'lot' AND status = 'completed' THEN 1 END) as completed_lots,
            COUNT(CASE WHEN approval_state = 'pending_review' THEN 1 END) as pending_approvals,
            COUNT(CASE WHEN type = 'inspection_request' THEN 1 END) as total_inspections
          FROM public.asset_heads
          WHERE project_id = $1 AND is_current AND NOT is_deleted
        `, [project.id])

        const stats = statsResult.rows[0]

        return {
          ...project,
          metrics: {
            totalLots: parseInt(stats.total_lots),
            completedLots: parseInt(stats.completed_lots),
            progress: stats.total_lots > 0 ? Math.round((stats.completed_lots / stats.total_lots) * 100) : 0,
            pendingApprovals: parseInt(stats.pending_approvals),
            totalInspections: parseInt(stats.total_inspections)
          }
        }
      })
    )

    return NextResponse.json({
      projects: projectsWithMetrics,
      total: projectsWithMetrics.length
    })
  } catch (error) {
    console.error('Error fetching client projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
