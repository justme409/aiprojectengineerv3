import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'

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
    const { templateId, wbsNodeIds } = body

    // Check access
    const accessCheck = await pool.query(`
      SELECT 1 FROM public.projects p
      JOIN public.organization_users ou ON ou.organization_id = p.organization_id
      WHERE p.id = $1 AND ou.user_id = $2
    `, [projectId, (session.user as any).id])

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // This would trigger the ITP generation graph
    // For now, return a mock response
    const mockItpDocument = {
      id: 'mock-itp-doc-id',
      name: 'Generated ITP Document',
      type: 'itp_document',
      project_id: projectId,
      status: 'draft',
      content: {
        generated_from_template: templateId,
        wbs_nodes: wbsNodeIds,
        items: [
          {
            id: '1',
            section_name: 'Concrete Works',
            inspection_test_point: 'Concrete Placement',
            acceptance_criteria: 'Visual inspection, no segregation',
            specification_clause: 'AS 3600',
            inspection_test_method: 'Visual',
            frequency: 'Continuous',
            responsibility: 'Site Engineer',
            hold_witness_point: 'Witness'
          }
        ]
      }
    }

    return NextResponse.json({
      message: 'ITP generation initiated',
      itp_document: mockItpDocument
    })
  } catch (error) {
    console.error('Error generating ITP:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}