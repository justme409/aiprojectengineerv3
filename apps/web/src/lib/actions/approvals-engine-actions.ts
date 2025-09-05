import { query } from '@/lib/db'
import { upsertAssetsAndEdges } from '@/lib/actions/graph-repo'

export async function createApprovalWorkflow(input: {
	project_id: string
	name: string
	description: string
	target_asset_id: string
	target_asset_type: string
	steps: Array<{
		step_number: number
		name: string
		description: string
		approvers: string[] // user or role IDs
		approval_type: 'any' | 'all' | 'majority'
		due_days: number
		required_fields?: string[]
	}>
	trigger_conditions?: any
}) {
	const spec = {
		asset: {
			type: 'approval_workflow',
			name: input.name,
			project_id: input.project_id,
			content: input
		},
		edges: [{
			from_asset_id: '',
			to_asset_id: input.target_asset_id,
			edge_type: 'APPLIES_TO'
		}],
		idempotency_key: `workflow:${input.project_id}:${input.name}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function createApprovalRule(input: {
	project_id: string
	name: string
	description: string
	conditions: any
	actions: any
	priority: number
	active: boolean
}) {
	const spec = {
		asset: {
			type: 'rule',
			name: input.name,
			project_id: input.project_id,
			content: input
		},
		idempotency_key: `rule:${input.project_id}:${input.name}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function assignWorkflow(workflowAssetId: string, assigneeId: string, stepNumber: number) {
	const spec = {
		asset: {
			type: 'task',
			name: `Approval Task - Step ${stepNumber}`,
			project_id: '', // Will be set from workflow
			content: {
				workflow_asset_id: workflowAssetId,
				assignee_id: assigneeId,
				step_number: stepNumber,
				status: 'pending'
			}
		},
		edges: [
			{
				from_asset_id: '',
				to_asset_id: workflowAssetId,
				edge_type: 'PART_OF'
			},
			{
				from_asset_id: '',
				to_asset_id: assigneeId,
				edge_type: 'ASSIGNED_TO'
			}
		],
		idempotency_key: `task:${workflowAssetId}:${stepNumber}:${assigneeId}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function evaluateRules(workflowAssetId: string, context: any) {
	// Find applicable rules and evaluate them
	const rules = await query(`
		SELECT * FROM public.assets
		WHERE project_id = (SELECT project_id FROM public.assets WHERE id = $1)
		AND type = 'rule'
		AND is_current AND NOT is_deleted
		ORDER BY content->>'priority' DESC
	`, [workflowAssetId])

	const results = []
	for (const rule of rules.rows) {
		// Simple rule evaluation (in production this would be more sophisticated)
		const conditions = rule.content?.conditions
		let matches = true

		if (conditions?.asset_type && context.asset_type !== conditions.asset_type) {
			matches = false
		}

		if (matches) {
			results.push({
				rule_id: rule.id,
				rule_name: rule.name,
				actions: rule.content?.actions,
				priority: rule.content?.priority
			})
		}
	}

	return results
}

export async function advanceWorkflowStep(workflowAssetId: string, stepNumber: number, decision: 'approved' | 'rejected', comments?: string, approverId?: string) {
	const workflow = await query('SELECT * FROM public.assets WHERE id=$1', [workflowAssetId])
	if (workflow.rows.length === 0) throw new Error('Workflow not found')

	const content = workflow.rows[0].content
	const currentStep = content.steps.find((s: any) => s.step_number === stepNumber)

	if (!currentStep) throw new Error('Step not found')

	// Update step status
	currentStep.status = decision
	currentStep.completed_at = new Date().toISOString()
	currentStep.completed_by = approverId
	if (comments) currentStep.comments = comments

	const spec = {
		asset: {
			id: workflowAssetId,
			content: {
				...content,
				current_step: decision === 'approved' ? stepNumber + 1 : stepNumber,
				status: decision === 'approved' && stepNumber >= content.steps.length ? 'completed' : 'in_progress'
			}
		},
		edges: approverId ? [{
			from_asset_id: workflowAssetId,
			to_asset_id: approverId,
			edge_type: decision === 'approved' ? 'APPROVED_BY' : 'REVIEWED_BY',
			properties: {
				step_number: stepNumber,
				decision,
				comments,
				approved_at: new Date().toISOString()
			}
		}] : [],
		idempotency_key: `advance:${workflowAssetId}:${stepNumber}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function delegateApproval(taskAssetId: string, newAssigneeId: string, delegatorId: string, reason?: string) {
	const spec = {
		asset: {
			id: taskAssetId,
			content: {
				delegated: true,
				delegated_by: delegatorId,
				delegated_to: newAssigneeId,
				delegated_at: new Date().toISOString(),
				delegation_reason: reason
			}
		},
		edges: [{
			from_asset_id: taskAssetId,
			to_asset_id: newAssigneeId,
			edge_type: 'ASSIGNED_TO'
		}],
		idempotency_key: `delegate:${taskAssetId}:${newAssigneeId}`
	}
	return upsertAssetsAndEdges(spec)
}

export async function escalateApproval(taskAssetId: string, escalatorId: string, reason?: string) {
	// Find the workflow and escalate to next level approvers
	const task = await query('SELECT * FROM public.assets WHERE id=$1', [taskAssetId])
	if (task.rows.length === 0) throw new Error('Task not found')

	const workflowId = task.rows[0].content?.workflow_asset_id
	const workflow = await query('SELECT * FROM public.assets WHERE id=$1', [workflowId])

	if (workflow.rows.length > 0) {
		const content = workflow.rows[0].content
		const stepNumber = task.rows[0].content?.step_number
		const step = content.steps.find((s: any) => s.step_number === stepNumber)

		if (step?.escalation_approvers) {
			// Create new tasks for escalation approvers
			for (const approverId of step.escalation_approvers) {
				await assignWorkflow(workflowId, approverId, stepNumber)
			}
		}
	}

	return { escalated: true }
}

export async function getWorkflows(projectId: string) {
	const { rows } = await query('SELECT * FROM public.assets WHERE project_id=$1 AND type=$2 AND is_current AND NOT is_deleted ORDER BY created_at DESC', [projectId, 'approval_workflow'])
	return rows
}

export async function getApprovalTasks(userId: string, projectId?: string) {
	let queryText = `
		SELECT a.*, w.name as workflow_name
		FROM public.assets a
		JOIN public.asset_edges e ON e.from_asset_id = a.id
		JOIN public.assets w ON w.id = e.to_asset_id
		WHERE a.type = 'task'
		AND e.edge_type = 'ASSIGNED_TO'
		AND e.to_asset_id = $1
		AND a.is_current AND NOT a.is_deleted
	`
	const params = [userId]

	if (projectId) {
		queryText += ' AND a.project_id = $2'
		params.push(projectId)
	}

	queryText += ' ORDER BY a.created_at DESC'

	const { rows } = await query(queryText, params)
	return rows
}
