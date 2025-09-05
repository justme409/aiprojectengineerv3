import { Suspense } from 'react'
import { redirect } from 'next/navigation'

export default function SubscriptionSyncPage() {
  // This would typically handle Stripe webhook processing
  // For now, redirect to dashboard
  redirect('/app/dashboard')
}

export function SubscriptionSyncContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Subscription</h2>
        <p className="text-gray-600">Please wait while we sync your subscription...</p>
      </div>
    </div>
  )
}
