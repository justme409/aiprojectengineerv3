import { NextRequest } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { projectId: string } }) {
  const { projectId } = params

  try {
    // Get ITP register
    const itpRegister = await query(`
      SELECT * FROM public.itp_register
      WHERE project_id = $1
      ORDER BY created_at DESC
    `, [projectId])

    return Response.json({ data: itpRegister.rows })
  } catch (error) {
    console.error('ITP register API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { projectId: string } }) {
  const { projectId } = params
  const body = await request.json()
  const action = body.action

  try {
    if (action === 'endorse_itp') {
      // NSW-specific ITP endorsement
      const endorsement = {
        itp_asset_id: body.itp_asset_id,
        endorsed_by: body.endorsed_by,
        role_at_endorsement: body.role_at_endorsement,
        endorsed_at: new Date().toISOString(),
        endorsement_notes: body.endorsement_notes
      }

      // Update ITP asset with endorsement
      await query(`
        UPDATE public.assets
        SET content = content || $2::jsonb,
            approval_state = 'approved'
        WHERE id = $1 AND type IN ('itp_template', 'itp_document')
      `, [body.itp_asset_id, JSON.stringify(endorsement)])

      return Response.json({ success: true, endorsement })
    }

    if (action === 'check_coverage') {
      // Check ITP coverage against jurisdiction requirements
      const coverage = await query(`
        SELECT
          itp.id,
          itp.content->>'jurisdiction_coverage_status' as coverage_status,
          itp.content->>'required_points_present' as required_points_present,
          COUNT(ip.id) as inspection_points_count
        FROM public.assets itp
        LEFT JOIN public.asset_edges e ON e.from_asset_id = itp.id AND e.edge_type = 'PARENT_OF'
        LEFT JOIN public.assets ip ON ip.id = e.to_asset_id AND ip.type = 'inspection_point'
        WHERE itp.id = $1 AND itp.type IN ('itp_template', 'itp_document')
        GROUP BY itp.id, itp.content
      `, [body.itp_asset_id])

      const result = coverage.rows[0]
      const isComplete = result?.coverage_status === 'complete' &&
                        result?.required_points_present === 'true' &&
                        (result?.inspection_points_count || 0) > 0

      return Response.json({
        itp_asset_id: body.itp_asset_id,
        coverage_status: result?.coverage_status || 'unknown',
        required_points_present: result?.required_points_present || false,
        inspection_points_count: result?.inspection_points_count || 0,
        is_complete: isComplete
      })
    }

    return new Response('Invalid action', { status: 400 })
  } catch (error) {
    console.error('ITP register POST error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
