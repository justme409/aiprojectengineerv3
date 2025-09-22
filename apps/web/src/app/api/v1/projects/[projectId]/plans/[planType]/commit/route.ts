import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function POST(
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

    const existing = await pool.query(
      `SELECT id FROM public.assets
       WHERE project_id = $1 AND type = 'plan' AND subtype = $2 AND is_current = true
       ORDER BY created_at DESC LIMIT 1`,
      [projectId, planType]
    )
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const assetId = existing.rows[0].id
    await pool.query(
      `UPDATE public.assets SET updated_at = NOW(), updated_by = $1 WHERE id = $2`,
      [(session.user as any).id, assetId]
    )

    return NextResponse.json({ id: assetId, message: 'Plan committed successfully' })
  } catch (error) {
    console.error('Error committing plan document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}




