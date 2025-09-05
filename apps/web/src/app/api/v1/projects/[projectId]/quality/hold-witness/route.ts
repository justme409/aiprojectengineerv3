import { NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

export async function GET(request: NextRequest, { params }: { params: { projectId: string } }) {
  const { projectId } = params

  try {
    // Get hold & witness register
    const register = await query(`
      SELECT * FROM public.hold_witness_register
      WHERE project_id = $1
      ORDER BY sla_due_at ASC
    `, [projectId])

    return Response.json({ data: register.rows })
  } catch (error) {
    console.error('Hold-witness API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { projectId: string } }) {
  const { projectId } = params
  const body = await request.json()
  const action = body.action

  try {
    if (action === 'create_inspection_point') {
      // Create a new inspection point (HP/WP)
      const result = await upsertAssetsAndEdges({
        asset: {
          type: 'inspection_point',
          name: body.title,
          project_id: projectId,
          content: {
            code: body.code,
            title: body.title,
            point_type: body.point_type, // 'hold' or 'witness'
            itp_item_ref: body.itp_item_ref,
            jurisdiction_rule_ref: body.jurisdiction_rule_ref,
            sla_due_at: body.sla_due_at,
            notified_at: null,
            released_at: null,
            status: 'pending'
          }
        },
        idempotency_key: `inspection_point:${projectId}:${body.code}`
      })

      return Response.json(result)
    }

    if (action === 'notify_witness') {
      // Notify witness point
      const result = await upsertAssetsAndEdges({
        asset: {
          id: body.inspection_point_id,
          content: {
            notified_at: new Date().toISOString(),
            status: 'notified'
          }
        },
        idempotency_key: `notify_witness:${body.inspection_point_id}`
      })

      return Response.json(result)
    }

    if (action === 'release_hold_point') {
      // Release hold point
      const result = await upsertAssetsAndEdges({
        asset: {
          id: body.inspection_point_id,
          content: {
            released_at: new Date().toISOString(),
            status: 'released',
            release_notes: body.release_notes
          }
        },
        idempotency_key: `release_hold:${body.inspection_point_id}`
      })

      return Response.json(result)
    }

    if (action === 'reject_hold_point') {
      // Reject hold point
      const result = await upsertAssetsAndEdges({
        asset: {
          id: body.inspection_point_id,
          content: {
            rejected_at: new Date().toISOString(),
            status: 'rejected',
            rejection_reason: body.rejection_reason
          }
        },
        idempotency_key: `reject_hold:${body.inspection_point_id}`
      })

      return Response.json(result)
    }

    if (action === 'set_sla') {
      // Set SLA for inspection point
      const result = await upsertAssetsAndEdges({
        asset: {
          id: body.inspection_point_id,
          content: {
            sla_due_at: body.sla_due_at,
            sla_hours: body.sla_hours
          }
        },
        idempotency_key: `set_sla:${body.inspection_point_id}`
      })

      return Response.json(result)
    }

    return new Response('Invalid action', { status: 400 })
  } catch (error) {
    console.error('Hold-witness POST error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
