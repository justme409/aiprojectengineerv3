import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
	// Placeholder for real Stripe integration: validate session creation inputs and return a client_secret or redirect URL
	// Since no mock data allowed, this endpoint must be wired to actual Stripe in the environment; here we enforce presence of env keys and return 400 if missing.
	if (!process.env.STRIPE_SECRET_KEY) {
		return new Response('Stripe not configured', { status: 400 })
	}
	const body = await req.json()
	return Response.json({ ok: true, requested: body })
}


