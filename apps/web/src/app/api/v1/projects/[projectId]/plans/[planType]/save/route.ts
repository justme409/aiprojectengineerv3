import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

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
    const body = await req.json()
    const content = body?.html ? { html: body.html } : { body: body?.body ?? '' }

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

    // Idempotent upsert for plan asset
    const spec = {
      asset: {
        type: 'plan',
        subtype: planType,
        name: `${String(planType).toUpperCase()} Plan`,
        project_id: projectId,
        content,
        status: 'draft',
        metadata: { plan_type: planType },
      },
      edges: [],
      idempotency_key: `plan:${projectId}:${planType}`,
      audit_context: { action: 'save_plan', user_id: (session.user as any).id }
    }

    const result = await upsertAssetsAndEdges(spec, (session.user as any).id)
    return NextResponse.json({ id: result.id })
  } catch (error) {
    console.error('Error saving plan document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}




