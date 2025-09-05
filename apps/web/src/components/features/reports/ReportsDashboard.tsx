'use client'

import { useEffect, useState } from 'react'

export default function ReportsDashboard({ projectId }: { projectId: string }) {
	const [data, setData] = useState<any>(null)
	useEffect(() => {
		const load = async () => {
			const res = await fetch(`/api/v1/reports?project_id=${projectId}`)
			const json = await res.json()
			setData(json)
		}
		load()
	}, [projectId])
	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-3">Reports</h1>
			<pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto">{JSON.stringify(data, null, 2)}</pre>
		</div>
	)
}
