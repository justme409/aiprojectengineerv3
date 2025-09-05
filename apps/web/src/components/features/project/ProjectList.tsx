import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ProjectList() {
	const { data } = useSWR('/api/v1/projects', fetcher)
	const items = data?.data || []
	return (
		<div className="space-y-2">
			{items.map((p: any) => (
				<div key={p.id} className="border rounded p-3">
					<div className="font-medium">{p.name}</div>
					<div className="text-sm text-gray-500">{p.client_name}</div>
				</div>
			))}
		</div>
	)
}
