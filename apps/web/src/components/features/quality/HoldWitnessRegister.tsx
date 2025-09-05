'use client'

import { useEffect, useState } from 'react'

interface InspectionPoint {
	inspection_point_id: string
	code: string
	title: string
	point_type: string
	itp_item_ref: string
	notified_at: string | null
	released_at: string | null
	sla_due_at: string
	approval_state: string
}

export default function HoldWitnessRegister({ projectId }: { projectId: string }) {
	const [items, setItems] = useState<InspectionPoint[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const load = async () => {
			try {
				const res = await fetch(`/api/v1/projects/${projectId}/quality/hold-witness`)
				const json = await res.json()
				setItems(json.data || [])
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [projectId])

	if (loading) return <div className="p-4">Loading...</div>

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-3">Hold & Witness Register</h1>
			<table className="w-full text-sm border">
				<thead>
					<tr className="bg-gray-50">
						<th className="p-2 text-left">Code</th>
						<th className="p-2 text-left">Title</th>
						<th className="p-2 text-left">Type</th>
						<th className="p-2 text-left">Status</th>
						<th className="p-2 text-left">SLA Due</th>
					</tr>
				</thead>
				<tbody>
					{items.map(p => (
						<tr key={p.inspection_point_id} className="border-t">
							<td className="p-2">{p.code}</td>
							<td className="p-2">{p.title}</td>
							<td className="p-2">{p.point_type}</td>
							<td className="p-2">{p.released_at ? 'Released' : p.notified_at ? 'Notified' : 'Pending'}</td>
							<td className={`p-2 ${new Date(p.sla_due_at) < new Date() ? 'text-red-600' : ''}`}>{new Date(p.sla_due_at).toLocaleString()}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}


