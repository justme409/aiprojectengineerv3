'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
	const [stats, setStats] = useState({
		projects: 0,
		activeInspections: 0,
		pendingApprovals: 0,
		overdueItems: 0
	})

	// Mock data - in real app, this would come from API
	useEffect(() => {
		setStats({
			projects: 5,
			activeInspections: 12,
			pendingApprovals: 3,
			overdueItems: 2
		})
	}, [])

	const quickActions = [
		{ href: '/app/projects', label: 'View Projects', icon: '📁' },
		{ href: '/app/projects', label: 'New Inspection', icon: '🔍' },
		{ href: '/app/projects', label: 'Upload Document', icon: '📄' },
		{ href: '/app/projects', label: 'Create Report', icon: '📊' }
	]

	const recentActivity = [
		{ type: 'inspection', message: 'Inspection IR-2024-001 completed', time: '2 hours ago' },
		{ type: 'document', message: 'Document uploaded: Foundation Plan v2', time: '4 hours ago' },
		{ type: 'approval', message: 'ITP Template approved', time: '1 day ago' },
		{ type: 'lot', message: 'Lot L001 marked as complete', time: '2 days ago' }
	]

	return (
		<main className="p-6 max-w-7xl mx-auto">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
				<p className="text-gray-600 mt-2">Welcome back! Here's your project overview.</p>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<span className="text-2xl">📁</span>
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-medium text-gray-900">Active Projects</h3>
							<p className="text-3xl font-bold text-blue-600">{stats.projects}</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<span className="text-2xl">🔍</span>
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-medium text-gray-900">Active Inspections</h3>
							<p className="text-3xl font-bold text-green-600">{stats.activeInspections}</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<span className="text-2xl">⏳</span>
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-medium text-gray-900">Pending Approvals</h3>
							<p className="text-3xl font-bold text-orange-600">{stats.pendingApprovals}</p>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
					<div className="flex items-center">
						<div className="flex-shrink-0">
							<span className="text-2xl">⚠️</span>
						</div>
						<div className="ml-4">
							<h3 className="text-lg font-medium text-gray-900">Overdue Items</h3>
							<p className="text-3xl font-bold text-red-600">{stats.overdueItems}</p>
						</div>
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="bg-white p-6 rounded-lg shadow mb-8">
				<h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{quickActions.map((action, index) => (
						<Link
							key={index}
							href={action.href}
							className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
						>
							<span className="text-2xl mb-2">{action.icon}</span>
							<span className="text-sm font-medium text-center">{action.label}</span>
						</Link>
					))}
				</div>
			</div>

			{/* Recent Activity */}
			<div className="bg-white p-6 rounded-lg shadow">
				<h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
				<div className="space-y-4">
					{recentActivity.map((activity, index) => (
						<div key={index} className="flex items-center space-x-4 py-2">
							<div className="flex-shrink-0">
								<span className="text-lg">
									{activity.type === 'inspection' && '🔍'}
									{activity.type === 'document' && '📄'}
									{activity.type === 'approval' && '✅'}
									{activity.type === 'lot' && '🏗️'}
								</span>
							</div>
							<div className="flex-1">
								<p className="text-sm text-gray-900">{activity.message}</p>
								<p className="text-xs text-gray-500">{activity.time}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</main>
	)
}
