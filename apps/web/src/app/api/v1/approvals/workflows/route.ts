import { NextRequest } from 'next/server'
import {
	createApprovalWorkflow,
	createApprovalRule,
	assignWorkflow,
	evaluateRules,
	advanceWorkflowStep,
	delegateApproval,
	escalateApproval,
	getWorkflows,
	getApprovalTasks
} from '@/lib/actions/approvals-engine-actions'

export async function GET(req: NextRequest) {
	const projectId = new URL(req.url).searchParams.get('project_id')
	const userId = new URL(req.url).searchParams.get('user_id')

	if (userId) {
		// Get tasks assigned to user
		const tasks = await getApprovalTasks(userId, projectId || undefined)
		return Response.json({ data: tasks })
	}

	if (!projectId) return new Response('project_id or user_id required', { status: 400 })

	const workflows = await getWorkflows(projectId)
	return Response.json({ data: workflows })
}

export async function POST(req: NextRequest) {
	const body = await req.json()
	const action = body.action

	if (action === 'create_workflow') {
		const result = await createApprovalWorkflow(body)
		return Response.json(result)
	}

	if (action === 'create_rule') {
		const result = await createApprovalRule(body)
		return Response.json(result)
	}

	if (action === 'assign_workflow') {
		const result = await assignWorkflow(body.workflow_asset_id, body.assignee_id, body.step_number)
		return Response.json(result)
	}

	if (action === 'evaluate_rules') {
		const result = await evaluateRules(body.workflow_asset_id, body.context)
		return Response.json({ rules: result })
	}

	if (action === 'advance_step') {
		const result = await advanceWorkflowStep(body.workflow_asset_id, body.step_number, body.decision, body.comments, body.approver_id)
		return Response.json(result)
	}

	if (action === 'delegate') {
		const result = await delegateApproval(body.task_asset_id, body.new_assignee_id, body.delegator_id, body.reason)
		return Response.json(result)
	}

	if (action === 'escalate') {
		const result = await escalateApproval(body.task_asset_id, body.escalator_id, body.reason)
		return Response.json(result)
	}

	return new Response('Invalid action', { status: 400 })
}
