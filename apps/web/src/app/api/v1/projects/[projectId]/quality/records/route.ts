import { NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

export async function GET(request: NextRequest, { params }: { params: { projectId: string } }) {
  const { projectId } = params

  try {
    // Get identified records register
    const records = await query(`
      SELECT * FROM public.identified_records_register
      WHERE project_id = $1
      ORDER BY created_at DESC
    `, [projectId])

    return Response.json({ data: records.rows })
  } catch (error) {
    console.error('Records handover API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { projectId: string } }) {
  const { projectId } = params
  const body = await request.json()
  const action = body.action

  try {
    if (action === 'mark_delivered') {
      // Mark records as delivered
      const delivery = {
        asset_id: body.asset_id,
        delivered_at: new Date().toISOString(),
        delivered_to: body.delivered_to,
        delivery_method: body.delivery_method,
        delivery_reference: body.delivery_reference,
        records_type: body.records_type
      }

      const result = await upsertAssetsAndEdges({
        asset: {
          type: 'record',
          name: `Records Delivery - ${body.records_type}`,
          project_id: projectId,
          content: delivery
        },
        idempotency_key: `records_delivery:${projectId}:${body.asset_id}`
      })

      // Update the original asset to mark as delivered
      await query(`
        UPDATE public.assets
        SET content = content || $2::jsonb
        WHERE id = $1
      `, [body.asset_id, JSON.stringify({
        records_delivered: true,
        delivered_at: new Date().toISOString(),
        delivery_reference: body.delivery_reference
      })])

      return Response.json(result)
    }

    if (action === 'create_rmp') {
      // Create Records Management Plan (RMP)
      const rmp = {
        title: body.title,
        scope: body.scope,
        records_schedule: body.records_schedule,
        retention_periods: body.retention_periods,
        disposal_methods: body.disposal_methods,
        jurisdiction_requirements: body.jurisdiction_requirements
      }

      const result = await upsertAssetsAndEdges({
        asset: {
          type: 'plan',
          subtype: 'records_management_plan',
          name: body.title,
          project_id: projectId,
          content: rmp
        },
        idempotency_key: `rmp:${projectId}:${body.title.toLowerCase().replace(/\s+/g, '_')}`
      })

      return Response.json(result)
    }

    if (action === 'update_identified_records') {
      // Update identified records list
      const updates = {
        records_identified: body.records_identified,
        last_updated: new Date().toISOString(),
        updated_by: body.updated_by
      }

      await query(`
        UPDATE public.assets
        SET content = content || $2::jsonb,
            updated_at = NOW()
        WHERE id = $1 AND type IN ('plan', 'itp_document', 'itp_template')
      `, [body.asset_id, JSON.stringify(updates)])

      return Response.json({ success: true })
    }

    return new Response('Invalid action', { status: 400 })
  } catch (error) {
    console.error('Records handover POST error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
