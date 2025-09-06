import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')

    if (!projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 })
    }

    // Check access
    const accessCheck = await pool.query(`
      SELECT 1 FROM public.projects p
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id
      WHERE p.id = $1 AND ou.user_id = $2
    `, [projectId, (session.user as any).id])

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    let query = `
      SELECT a.* FROM public.asset_heads a
      WHERE a.project_id = $1 AND a.type = 'approval_workflow'
    `
    const params = [projectId]
    let paramIndex = 2

    if (status) {
      query += ` AND a.content->>'status' = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    query += ` ORDER BY a.created_at DESC`

    const result = await pool.query(query, params)
    return NextResponse.json({ workflows: result.rows })
  } catch (error) {
    console.error('Error fetching approval workflows:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, name, workflowDefinition, targetAssetId } = body

    const spec = {
      asset: {
        type: 'approval_workflow',
        name,
        project_id: projectId,
        content: {
          workflow_definition: workflowDefinition,
          target_asset_id: targetAssetId,
          status: 'pending',
          current_step: 0
        },
        status: 'active'
      },
      edges: [],
      idempotency_key: `approval_workflow:${name}:${projectId}`,
      audit_context: { action: 'create_approval_workflow', user_id: (session.user as any).id }
    }

    const result = await upsertAssetsAndEdges(spec, (session.user as any).id)
    return NextResponse.json({ id: result.id })
  } catch (error) {
    console.error('Error creating approval workflow:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, action, decision } = body

    if (action === 'advance') {
      // Advance workflow step
      await pool.query(`
        UPDATE public.assets
        SET content = jsonb_set(
          jsonb_set(content, '{current_step}', (content->>'current_step')::int + 1),
          '{status}', '"in_progress"'
        ),
            updated_at = now(), updated_by = $1
        WHERE id = $2
      `, [(session.user as any).id, id])

      return NextResponse.json({ message: 'Workflow advanced' })
    } else if (action === 'decide') {
      // Record approval decision
      await pool.query(`
        UPDATE public.assets
        SET content = jsonb_set(
          jsonb_set(content, '{decision}', $1::jsonb),
          '{status}', '"completed"'
        ),
            updated_at = now(), updated_by = $2
        WHERE id = $3
      `, [JSON.stringify({ decision, decided_by: (session.user as any).id, decided_at: new Date().toISOString() }), (session.user as any).id, id])

      return NextResponse.json({ message: 'Decision recorded' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating approval workflow:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}