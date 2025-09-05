"use client"
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function DocumentList({ projectId }: { projectId: string }) {
	const { data } = useSWR(projectId ? `/api/v1/documents?project_id=${projectId}` : null, fetcher)
	const items = data?.data || []
	return (
		<div className="space-y-2">
			{items.map((d: any) => (
				<div key={d.id} className="border rounded p-3">
					<div className="font-medium">{d.file_name}</div>
					<div className="text-sm text-gray-500">{d.content_type}</div>
				</div>
			))}
		</div>
	)
}
