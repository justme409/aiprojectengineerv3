import NextAuth from 'next-auth'
import { authProviders } from './providers'

export const { handlers, auth, signIn, signOut } = NextAuth({
	providers: authProviders,
	callbacks: {
		session: async ({ session, token }) => {
			if (session.user && token.sub) {
				(session.user as any).id = token.sub
				;(session.user as any).organizationId = token.organizationId
				;(session.user as any).role = token.role
			}
			return session
		},
		jwt: async ({ token, user }) => {
			if (user) {
				token.organizationId = (user as any).organizationId
				token.role = (user as any).role
			}
			return token
		},
	},
	pages: {
		signIn: '/auth/login',
		error: '/auth/login'
	},
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
})

// Export for compatibility with middleware
export const authOptions = {
	providers: authProviders,
	callbacks: {
		session: async ({ session, token }: any) => {
			if (session.user && token.sub) {
				(session.user as any).id = token.sub
				;(session.user as any).organizationId = token.organizationId
				;(session.user as any).role = token.role
			}
			return session
		},
		jwt: async ({ token, user }: any) => {
			if (user) {
				token.organizationId = (user as any).organizationId
				token.role = (user as any).role
			}
			return token
		},
	},
	pages: {
		signIn: '/auth/login',
		error: '/auth/login'
	},
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	secret: process.env.NEXTAUTH_SECRET
}
