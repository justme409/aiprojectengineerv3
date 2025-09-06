import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'wbs' or 'lbs'

    if (type === 'wbs') {
      const result = await pool.query(`
        SELECT a.*,
               json_agg(json_build_object(
                 'id', child.id,
                 'name', child.name,
                 'path_key', child.path_key,
                 'type', child.type
               )) as children
        FROM public.asset_heads a
        LEFT JOIN public.asset_edges ae ON ae.from_asset_id = a.id AND ae.edge_type = 'PARENT_OF'
        LEFT JOIN public.assets child ON child.id = ae.to_asset_id AND child.is_current AND NOT child.is_deleted
        WHERE a.project_id = $1 AND a.type = 'wbs_node'
        GROUP BY a.id, a.asset_uid, a.version, a.is_current, a.supersedes_asset_id,
                 a.version_label, a.effective_from, a.effective_to, a.type, a.subtype,
                 a.name, a.organization_id, a.project_id, a.parent_asset_id, a.document_number,
                 a.revision_code, a.path_key, a.status, a.approval_state, a.classification,
                 a.idempotency_key, a.metadata, a.content, a.due_sla_at, a.scheduled_at,
                 a.requested_for_at, a.created_at, a.created_by, a.updated_at, a.updated_by, a.is_deleted
        ORDER BY a.path_key
      `, [projectId])

      return NextResponse.json({ wbs: result.rows })
    } else if (type === 'lbs') {
      const result = await pool.query(`
        SELECT a.*,
               json_agg(json_build_object(
                 'id', child.id,
                 'name', child.name,
                 'path_key', child.path_key,
                 'type', child.type
               )) as children
        FROM public.asset_heads a
        LEFT JOIN public.asset_edges ae ON ae.from_asset_id = a.id AND ae.edge_type = 'PARENT_OF'
        LEFT JOIN public.assets child ON child.id = ae.to_asset_id AND child.is_current AND NOT child.is_deleted
        WHERE a.project_id = $1 AND a.type = 'lbs_node'
        GROUP BY a.id, a.asset_uid, a.version, a.is_current, a.supersedes_asset_id,
                 a.version_label, a.effective_from, a.effective_to, a.type, a.subtype,
                 a.name, a.organization_id, a.project_id, a.parent_asset_id, a.document_number,
                 a.revision_code, a.path_key, a.status, a.approval_state, a.classification,
                 a.idempotency_key, a.metadata, a.content, a.due_sla_at, a.scheduled_at,
                 a.requested_for_at, a.created_at, a.created_by, a.updated_at, a.updated_by, a.is_deleted
        ORDER BY a.path_key
      `, [projectId])

      return NextResponse.json({ lbs: result.rows })
    } else {
      return NextResponse.json({ error: 'Type parameter required (wbs or lbs)' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await params
    const body = await request.json()
    const { type, name, path_key, parent_asset_id } = body

    if (!['wbs_node', 'lbs_node'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    const spec = {
      asset: {
        type,
        name,
        project_id: projectId,
        path_key,
        parent_asset_id,
        status: 'draft'
      },
      edges: parent_asset_id ? [{
        from_asset_id: parent_asset_id,
        to_asset_id: '', // Will be set after asset creation
        edge_type: 'PARENT_OF',
        properties: {}
      }] : [],
      idempotency_key: `${type}:${path_key}:${projectId}`,
      audit_context: { action: 'create_plan_node', user_id: (session.user as any).id }
    }

    // Note: This would need the graph-repo to handle the edge creation properly
    // For now, just create the asset
    const result = await pool.query(`
      INSERT INTO public.assets (id, asset_uid, version, type, name, project_id, path_key, parent_asset_id, status)
      VALUES (gen_random_uuid(), gen_random_uuid(), 1, $1, $2, $3, $4, $5, 'draft')
      RETURNING *
    `, [type, name, projectId, path_key, parent_asset_id])

    return NextResponse.json({ node: result.rows[0] })
  } catch (error) {
    console.error('Error creating plan node:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}