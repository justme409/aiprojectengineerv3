import { NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

export async function GET(request: NextRequest, { params }: { params: { projectId: string } }) {
  const { projectId } = params
  const action = request.nextUrl.searchParams.get('action') || 'list'

  try {
    if (action === 'list') {
      // Get work lot register data
      const lots = await query(`
        SELECT * FROM public.work_lot_register
        WHERE project_id = $1
        ORDER BY created_at DESC
      `, [projectId])

      return Response.json({ data: lots.rows })
    }

    if (action === 'register') {
      // Get lot register view
      const register = await query(`
        SELECT * FROM public.work_lot_register
        WHERE project_id = $1
        ORDER BY lot_number
      `, [projectId])

      return Response.json({ data: register.rows })
    }

    return new Response('Invalid action', { status: 400 })
  } catch (error) {
    console.error('Quality lots API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { projectId: string } }) {
  const { projectId } = params
  const body = await request.json()
  const action = body.action

  try {
    if (action === 'create_lot') {
      // Create a new work lot
      const result = await upsertAssetsAndEdges({
        asset: {
          type: 'lot',
          name: body.name,
          project_id: projectId,
          content: {
            lot_number: body.lot_number,
            status: 'planned',
            itp_document_asset_id: body.itp_document_asset_id,
            lbs_node_asset_id: body.lbs_node_asset_id
          }
        },
        idempotency_key: `lot:${projectId}:${body.lot_number}`
      })

      return Response.json(result)
    }

    if (action === 'plan_sampling') {
      // Plan sampling for a lot
      const samplingPlan = {
        lot_id: body.lot_id,
        sampling_method: body.sampling_method || 'annex_l',
        planned_samples: body.planned_samples || [],
        test_requirements: body.test_requirements || []
      }

      const result = await upsertAssetsAndEdges({
        asset: {
          type: 'inspection_request',
          name: `Sampling Plan for Lot ${body.lot_number}`,
          project_id: projectId,
          content: samplingPlan
        },
        idempotency_key: `sampling_plan:${projectId}:${body.lot_id}`
      })

      return Response.json(result)
    }

    return new Response('Invalid action', { status: 400 })
  } catch (error) {
    console.error('Quality lots POST error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { projectId: string } }) {
  const { projectId } = params
  const body = await request.json()
  const action = body.action

  try {
    if (action === 'close_lot') {
      // Close a work lot
      const result = await upsertAssetsAndEdges({
        asset: {
          id: body.lot_id,
          content: {
            status: 'closed',
            closed_at: new Date().toISOString(),
            close_reason: body.close_reason
          }
        },
        idempotency_key: `close_lot:${body.lot_id}`
      })

      return Response.json(result)
    }

    if (action === 'reopen_lot') {
      // Reopen a work lot
      const result = await upsertAssetsAndEdges({
        asset: {
          id: body.lot_id,
          content: {
            status: 'active',
            reopened_at: new Date().toISOString(),
            reopen_reason: body.reopen_reason
          }
        },
        idempotency_key: `reopen_lot:${body.lot_id}`
      })

      return Response.json(result)
    }

    if (action === 'apply_indicative_conformance') {
      // Apply indicative conformance (QLD specific)
      const result = await upsertAssetsAndEdges({
        asset: {
          type: 'record',
          name: `Indicative Conformance for Lot ${body.lot_number}`,
          project_id: projectId,
          content: {
            lot_asset_id: body.lot_id,
            conformance_type: 'indicative',
            applied_at: new Date().toISOString(),
            criteria: body.criteria
          }
        },
        idempotency_key: `indicative_conformance:${projectId}:${body.lot_id}`
      })

      return Response.json(result)
    }

    return new Response('Invalid action', { status: 400 })
  } catch (error) {
    console.error('Quality lots PUT error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
