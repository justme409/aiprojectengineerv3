"use client"
import { useState } from 'react'
import { signIn } from 'next-auth/react'

export default function PasswordSignIn() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		try {
			await signIn('credentials', { email, password, callbackUrl: '/app/dashboard' })
		} catch (error) {
			console.error('Login failed:', error)
		}
		setLoading(false)
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label className="block text-sm font-medium">Email</label>
				<input
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full px-3 py-2 border rounded"
					required
				/>
			</div>
			<div>
				<label className="block text-sm font-medium">Password</label>
				<input
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full px-3 py-2 border rounded"
					required
				/>
			</div>
			<button
				type="submit"
				disabled={loading}
				className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
			>
				{loading ? 'Signing in...' : 'Sign In'}
			</button>
		</form>
	)
}
