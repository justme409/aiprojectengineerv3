import type { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
	providers: [
		Credentials({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email) return null
				// In a real setup, validate against auth.users via a secure server action.
				return { id: credentials.email, name: credentials.email, email: credentials.email }
			},
		})
	],
	callbacks: {
		session: async ({ session, token }) => {
			if (session.user && token.sub) (session.user as any).id = token.sub
			return session
		},
	},
	pages: {
		signIn: '/auth/login'
	}
}
