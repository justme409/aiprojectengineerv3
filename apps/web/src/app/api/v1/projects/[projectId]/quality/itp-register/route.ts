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
    const status = searchParams.get('status')
    const wbsNode = searchParams.get('wbs_node')

    // Build the query to get ITP register data
    let query = `
      SELECT
        a.id,
        a.name,
        a.document_number,
        a.revision_code,
        a.status,
        a.approval_state,
        a.created_at,
        a.updated_at,
        a.content,
        COALESCE(a.content->>'wbs_node', '') as wbs_node,
        COALESCE(a.content->>'lbs_node', '') as lbs_node,
        COALESCE((a.content->>'item_count')::int, 0) as item_count,
        COALESCE((a.content->>'completed_items')::int, 0) as completed_items,
        -- Count related inspection points
        (
          SELECT COUNT(*)
          FROM asset_edges ae
          JOIN assets ip ON ip.id = ae.to_asset_id
          WHERE ae.from_asset_id = a.id
            AND ae.edge_type IN ('REFERENCES', 'IMPLEMENTS')
            AND ip.type = 'inspection_point'
        ) as inspection_points_count,
        -- Get latest approval info
        (
          SELECT json_build_object(
            'approved_at', ae.properties->>'approved_at',
            'approved_by', u.name,
            'role', ae.properties->>'role_at_signing'
          )
          FROM asset_edges ae
          JOIN auth.users u ON u.id::text = ae.to_asset_id
          WHERE ae.from_asset_id = a.id
            AND ae.edge_type = 'APPROVED_BY'
          ORDER BY ae.created_at DESC
          LIMIT 1
        ) as latest_approval
      FROM public.asset_heads a
      WHERE a.project_id = $1
        AND a.type IN ('itp_document', 'itp_template')
        AND a.is_current = true
        AND a.is_deleted = false
    `

    const queryParams = [projectId]
    let paramIndex = 2

    // Add status filter if provided
    if (status && status !== 'all') {
      query += ` AND a.approval_state = $${paramIndex}`
      queryParams.push(status)
      paramIndex++
    }

    // Add WBS filter if provided
    if (wbsNode) {
      query += ` AND a.content->>'wbs_node' = $${paramIndex}`
      queryParams.push(wbsNode)
      paramIndex++
    }

    query += ` ORDER BY a.updated_at DESC`

    const result = await pool.query(query, queryParams)

    // Calculate summary statistics
    const stats = {
      total: result.rows.length,
      approved: result.rows.filter(row => row.approval_state === 'approved').length,
      pending: result.rows.filter(row => row.approval_state === 'pending_review').length,
      draft: result.rows.filter(row => row.status === 'draft').length,
      rejected: result.rows.filter(row => row.approval_state === 'rejected').length,
      totalItems: result.rows.reduce((sum, row) => sum + (row.item_count || 0), 0),
      completedItems: result.rows.reduce((sum, row) => sum + (row.completed_items || 0), 0)
    }

    stats.completionRate = stats.totalItems > 0
      ? Math.round((stats.completedItems / stats.totalItems) * 100)
      : 0

    return NextResponse.json({
      itpRegister: result.rows,
      stats
    })
  } catch (error) {
    console.error('Error fetching ITP register:', error)
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
    const { name, documentNumber, revision, wbsNode, lbsNode, description } = body

    if (!name) {
      return NextResponse.json({ error: 'ITP name is required' }, { status: 400 })
    }

    // Create ITP register entry
    const itpAsset = {
      asset: {
        type: 'itp_document',
        name,
        project_id: projectId,
        document_number: documentNumber,
        revision_code: revision || '1',
        content: {
          wbs_node: wbsNode,
          lbs_node: lbsNode,
          description,
          item_count: 0,
          completed_items: 0,
          itp_register_entry: true
        },
        status: 'draft',
        approval_state: 'not_required'
      },
      edges: [],
      idempotency_key: `itp-register:${projectId}:${documentNumber || name}:${Date.now()}`,
      audit_context: { action: 'create_itp_register_entry', user_id: (session.user as any).id }
    }

    // Import the upsert function
    const { upsertAssetsAndEdges } = await import('@/lib/actions/graph-repo')
    const result = await upsertAssetsAndEdges(itpAsset, (session.user as any).id)

    return NextResponse.json({
      itpEntry: result,
      message: 'ITP register entry created successfully'
    })
  } catch (error) {
    console.error('Error creating ITP register entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
