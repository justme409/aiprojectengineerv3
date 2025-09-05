"use client"
import { useState, useEffect } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface InspectionRegisterProps {
	projectId: string
}

export default function InspectionRegister({ projectId }: InspectionRegisterProps) {
	const { data, mutate } = useSWR(`/api/v1/inspections?project_id=${projectId}`, fetcher)
	const inspections = data?.data || []

	const [filter, setFilter] = useState('')
	const [statusFilter, setStatusFilter] = useState('all')

	const filteredInspections = inspections.filter((ir: any) => {
		const matchesText = ir.content?.checkpoint_id?.toLowerCase().includes(filter.toLowerCase()) ||
		                   ir.name?.toLowerCase().includes(filter.toLowerCase())
		const matchesStatus = statusFilter === 'all' || ir.approval_state === statusFilter
		return matchesText && matchesStatus
	})

	const handleCreateIR = async () => {
		// Placeholder for IR creation modal
		alert('IR creation modal would open here')
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<div className="flex gap-4">
					<input
						type="text"
						placeholder="Filter inspections..."
						value={filter}
						onChange={(e) => setFilter(e.target.value)}
						className="px-3 py-2 border rounded"
					/>
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="px-3 py-2 border rounded"
					>
						<option value="all">All Status</option>
						<option value="draft">Draft</option>
						<option value="pending_review">Pending Review</option>
						<option value="approved">Approved</option>
					</select>
				</div>
				<button
					onClick={handleCreateIR}
					className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
				>
					Create IR
				</button>
			</div>

			<div className="overflow-x-auto">
				<table className="min-w-full bg-white border">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-4 py-2 text-left">Checkpoint ID</th>
							<th className="px-4 py-2 text-left">Name</th>
							<th className="px-4 py-2 text-left">Status</th>
							<th className="px-4 py-2 text-left">SLA Due</th>
							<th className="px-4 py-2 text-left">Scheduled</th>
							<th className="px-4 py-2 text-left">Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredInspections.map((ir: any) => (
							<tr key={ir.id} className="border-t">
								<td className="px-4 py-2">{ir.content?.checkpoint_id}</td>
								<td className="px-4 py-2">{ir.name}</td>
								<td className="px-4 py-2">
									<span className={`px-2 py-1 rounded text-xs ${
										ir.approval_state === 'approved' ? 'bg-green-100 text-green-800' :
										ir.approval_state === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
										'bg-gray-100 text-gray-800'
									}`}>
										{ir.approval_state}
									</span>
								</td>
								<td className="px-4 py-2">
									{ir.content?.sla_due_at ? new Date(ir.content.sla_due_at).toLocaleDateString() : 'N/A'}
								</td>
								<td className="px-4 py-2">
									{ir.content?.scheduled_at ? new Date(ir.content.scheduled_at).toLocaleDateString() : 'Not scheduled'}
								</td>
								<td className="px-4 py-2">
									<button className="text-blue-600 hover:text-blue-800 text-sm">
										View Details
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{filteredInspections.length === 0 && (
				<div className="text-center py-8 text-gray-500">
					No inspection requests found. Create inspection requests for quality checkpoints.
				</div>
			)}
		</div>
	)
}
