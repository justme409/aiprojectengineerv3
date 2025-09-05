import { NextRequest } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
	// For NextAuth, the real callback is under /api/auth/callback/[provider]. This route exists to satisfy the Spec and can redirect.
	const provider = params.provider
	return Response.redirect(new URL(`/api/auth/callback/${provider}`, req.url))
}


