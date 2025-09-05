import PasswordSignIn from '@/components/features/auth/PasswordSignIn'

export default function LoginPage() {
	return (
		<main className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full space-y-8 p-8">
				<div>
					<h2 className="text-center text-3xl font-extrabold text-gray-900">
						Sign in to ProjectPro
					</h2>
				</div>
				<PasswordSignIn />
			</div>
		</main>
	)
}
