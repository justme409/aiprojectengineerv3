import { NextRequest } from 'next/server'
import { query } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

export async function GET(request: NextRequest, { params }: { params: { projectId: string } }) {
  const { projectId } = params
  const action = request.nextUrl.searchParams.get('action') || 'contracts'

  try {
    if (action === 'contracts') {
      // Get primary testing contracts
      const contracts = await query(`
        SELECT a.* FROM public.assets a
        WHERE a.project_id = $1
          AND a.type = 'contract'
          AND a.content->>'contract_type' = 'primary_testing'
          AND a.is_current AND NOT a.is_deleted
        ORDER BY a.created_at DESC
      `, [projectId])

      return Response.json({ data: contracts.rows })
    }

    if (action === 'labs') {
      // Get accredited labs
      const labs = await query(`
        SELECT a.* FROM public.assets a
        WHERE a.type = 'lab'
          AND a.is_current AND NOT a.is_deleted
        ORDER BY a.name
      `)

      return Response.json({ data: labs.rows })
    }

    if (action === 'schedule') {
      // Get testing schedule
      const schedule = await query(`
        SELECT a.* FROM public.assets a
        WHERE a.project_id = $1
          AND a.type = 'test_request'
          AND a.content->>'test_type' = 'primary'
          AND a.is_current AND NOT a.is_deleted
        ORDER BY a.content->>'scheduled_at' ASC
      `, [projectId])

      return Response.json({ data: schedule.rows })
    }

    return new Response('Invalid action', { status: 400 })
  } catch (error) {
    console.error('Primary testing API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { projectId: string } }) {
  const { projectId } = params
  const body = await request.json()
  const action = body.action

  try {
    if (action === 'create_contract') {
      // Create primary testing contract
      const contract = {
        contract_number: body.contract_number,
        contract_type: 'primary_testing',
        contractor_name: body.contractor_name,
        lab_name: body.lab_name,
        lab_asset_id: body.lab_asset_id,
        scope_of_testing: body.scope_of_testing,
        testing_frequency: body.testing_frequency,
        contract_value: body.contract_value,
        start_date: body.start_date,
        end_date: body.end_date,
        accreditation_requirements: body.accreditation_requirements
      }

      const result = await upsertAssetsAndEdges({
        asset: {
          type: 'contract',
          name: `Primary Testing Contract ${body.contract_number}`,
          project_id: projectId,
          content: contract
        },
        idempotency_key: `primary_contract:${projectId}:${body.contract_number}`
      })

      return Response.json(result)
    }

    if (action === 'assign_lab') {
      // Assign lab to contract
      const assignment = {
        contract_asset_id: body.contract_asset_id,
        lab_asset_id: body.lab_asset_id,
        assigned_at: new Date().toISOString(),
        assignment_notes: body.assignment_notes
      }

      const result = await upsertAssetsAndEdges({
        asset: {
          type: 'record',
          name: `Lab Assignment - ${body.lab_name}`,
          project_id: projectId,
          content: assignment
        },
        idempotency_key: `lab_assignment:${projectId}:${body.contract_asset_id}`
      })

      return Response.json(result)
    }

    if (action === 'schedule_test') {
      // Schedule primary test
      const testRequest = {
        test_type: 'primary',
        contract_asset_id: body.contract_asset_id,
        lab_asset_id: body.lab_asset_id,
        test_method: body.test_method,
        sample_location: body.sample_location,
        scheduled_at: body.scheduled_at,
        priority: body.priority || 'normal',
        special_instructions: body.special_instructions
      }

      const result = await upsertAssetsAndEdges({
        asset: {
          type: 'test_request',
          name: `${body.test_method} - ${body.sample_location}`,
          project_id: projectId,
          content: testRequest
        },
        idempotency_key: `primary_test:${projectId}:${body.test_method}:${Date.now()}`
      })

      return Response.json(result)
    }

    return new Response('Invalid action', { status: 400 })
  } catch (error) {
    console.error('Primary testing POST error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
