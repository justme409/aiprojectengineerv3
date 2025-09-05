'use client'

import { useState } from 'react'

export default function AccountPage() {
	const [activeTab, setActiveTab] = useState('profile')

	const tabs = [
		{ id: 'profile', label: 'Profile' },
		{ id: 'security', label: 'Security' },
		{ id: 'preferences', label: 'Preferences' },
		{ id: 'billing', label: 'Billing' }
	]

	return (
		<main className="p-6 max-w-4xl mx-auto">
			<h1 className="text-3xl font-bold mb-6">Account Settings</h1>

			<div className="bg-white rounded-lg shadow">
				<div className="border-b border-gray-200">
					<nav className="flex space-x-8 px-6">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`py-4 px-1 border-b-2 font-medium text-sm ${
									activeTab === tab.id
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
							>
								{tab.label}
							</button>
						))}
					</nav>
				</div>

				<div className="p-6">
					{activeTab === 'profile' && (
						<div className="space-y-6">
							<h2 className="text-xl font-semibold">Profile Information</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										First Name
									</label>
									<input
										type="text"
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Enter first name"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Last Name
									</label>
									<input
										type="text"
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Enter last name"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Email
									</label>
									<input
										type="email"
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Enter email"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Phone
									</label>
									<input
										type="tel"
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Enter phone number"
									/>
								</div>
							</div>
							<div className="flex justify-end">
								<button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
									Save Changes
								</button>
							</div>
						</div>
					)}

					{activeTab === 'security' && (
						<div className="space-y-6">
							<h2 className="text-xl font-semibold">Security Settings</h2>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Current Password
									</label>
									<input
										type="password"
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Enter current password"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										New Password
									</label>
									<input
										type="password"
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Enter new password"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Confirm New Password
									</label>
									<input
										type="password"
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Confirm new password"
									/>
								</div>
							</div>
							<div className="flex justify-end">
								<button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
									Update Password
								</button>
							</div>
						</div>
					)}

					{activeTab === 'preferences' && (
						<div className="space-y-6">
							<h2 className="text-xl font-semibold">Preferences</h2>
							<div className="space-y-4">
								<div className="flex items-center">
									<input
										id="notifications"
										type="checkbox"
										className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
									/>
									<label htmlFor="notifications" className="ml-2 block text-sm text-gray-900">
										Receive email notifications
									</label>
								</div>
								<div className="flex items-center">
									<input
										id="marketing"
										type="checkbox"
										className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
									/>
									<label htmlFor="marketing" className="ml-2 block text-sm text-gray-900">
										Receive marketing communications
									</label>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Timezone
									</label>
									<select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
										<option>Australia/Sydney</option>
										<option>Australia/Melbourne</option>
										<option>Australia/Brisbane</option>
									</select>
								</div>
							</div>
							<div className="flex justify-end">
								<button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
									Save Preferences
								</button>
							</div>
						</div>
					)}

					{activeTab === 'billing' && (
						<div className="space-y-6">
							<h2 className="text-xl font-semibold">Billing Information</h2>
							<div className="bg-gray-50 p-4 rounded-lg">
								<p className="text-sm text-gray-600">Current Plan: Professional</p>
								<p className="text-sm text-gray-600">Next billing date: January 15, 2025</p>
							</div>
							<div className="flex justify-end space-x-3">
								<button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
									Manage Subscription
								</button>
								<button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
									Update Payment Method
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</main>
	)
}
