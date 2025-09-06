import { Suspense } from 'react'
import { redirect } from 'next/navigation'

export default function SubscriptionSyncPage() {
  // This would typically handle Stripe webhook processing
  // For now, redirect to dashboard
  redirect('/app/dashboard')
}
