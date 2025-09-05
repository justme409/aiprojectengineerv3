'use client'

import { useEffect, useState } from 'react'

export default function ApprovalsInbox({ userId, projectId }: { userId: string, projectId?: string }) {
	const [tasks, setTasks] = useState<any[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const load = async () => {
			try {
				const qs = new URLSearchParams({ user_id: userId, ...(projectId ? { project_id: projectId } : {}) })
				const res = await fetch(`/api/v1/approvals/workflows?${qs.toString()}`)
				const json = await res.json()
				setTasks(json.data || [])
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [userId, projectId])

	if (loading) return <div className="p-4">Loading...</div>

	return (
		<div className="p-4 space-y-3">
			<h1 className="text-2xl font-bold">My Approval Tasks</h1>
			<ul className="space-y-2">
				{tasks.map(t => (
					<li key={t.id} className="border rounded p-3">
						<div className="font-semibold">{t.name}</div>
						<div className="text-xs text-muted-foreground">Workflow: {t.workflow_name}</div>
						<div className="text-xs">Step: {t.content?.step_number} · Status: {t.content?.status}</div>
					</li>
				))}
			</ul>
		</div>
	)
}


