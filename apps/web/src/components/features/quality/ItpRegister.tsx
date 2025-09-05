'use client'

import { useEffect, useState } from 'react'

interface ItpRow {
	project_id: string
	itp_asset_id: string
	version: number
	approval_state: string
	approvals: any[] | null
	jurisdiction_coverage_status: string | null
	required_points_present: string | null
}

export default function ItpRegister({ projectId }: { projectId: string }) {
	const [rows, setRows] = useState<ItpRow[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const load = async () => {
			try {
				const res = await fetch(`/api/v1/projects/${projectId}/quality/itp`)
				const json = await res.json()
				setRows(json.data || [])
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [projectId])

	if (loading) return <div className="p-4">Loading...</div>

	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-3">ITP Register</h1>
			<table className="w-full text-sm border">
				<thead>
					<tr className="bg-gray-50">
						<th className="p-2 text-left">ITP Asset</th>
						<th className="p-2 text-left">Version</th>
						<th className="p-2 text-left">Approval State</th>
						<th className="p-2 text-left">Coverage</th>
						<th className="p-2 text-left">Required Points</th>
					</tr>
				</thead>
				<tbody>
					{rows.map(r => (
						<tr key={r.itp_asset_id} className="border-t">
							<td className="p-2">{r.itp_asset_id}</td>
							<td className="p-2">{r.version}</td>
							<td className="p-2">{r.approval_state}</td>
							<td className="p-2">{r.jurisdiction_coverage_status || '-'}</td>
							<td className="p-2">{r.required_points_present || '-'}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}


