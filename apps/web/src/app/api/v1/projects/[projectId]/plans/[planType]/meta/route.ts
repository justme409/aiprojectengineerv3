import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string; planType: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, planType } = await params

    // Access check
    const accessCheck = await pool.query(
      `SELECT 1 FROM public.projects p
       JOIN public.organization_users ou ON ou.organization_id = p.organization_id
       WHERE p.id = $1 AND ou.user_id = $2`,
      [projectId, (session.user as any).id]
    )
    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const plan = await pool.query(
      `SELECT revision_code, metadata FROM public.assets
       WHERE project_id = $1 AND type = 'plan' AND subtype = $2 AND is_current = true
       ORDER BY created_at DESC LIMIT 1`,
      [projectId, planType]
    )

    if (plan.rows.length === 0) {
      return NextResponse.json({
        revisionIdentifier: 'A',
        approverName: null,
        approvedAt: null
      })
    }

    const row = plan.rows[0]
    // Placeholder meta values until revision/approval tables exist
    return NextResponse.json({
      revisionIdentifier: row.revision_code || 'A',
      approverName: null,
      approvedAt: null
    })
  } catch (error) {
    console.error('Error fetching plan meta:', error)
    return NextResponse.json({
      revisionIdentifier: 'A',
      approverName: null,
      approvedAt: null
    })
  }
}




