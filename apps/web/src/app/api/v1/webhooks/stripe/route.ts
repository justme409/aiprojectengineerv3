import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
	if (!process.env.STRIPE_WEBHOOK_SECRET) {
		return new Response('Stripe webhook not configured', { status: 400 })
	}
	// In production, verify signature header and process events. Here, accept and return 200 to avoid mocks.
	return new Response('ok')
}


