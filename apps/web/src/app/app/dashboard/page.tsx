'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useFeatureFlags, FeatureGate } from '@/lib/hooks/use-feature-flags'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const { flags, loading: flagsLoading } = useFeatureFlags()
  const router = useRouter()

  if (status === 'loading' || flagsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 h-8 bg-gray-200 rounded w-1/3"></h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session.user?.name || 'User'}!
          </h1>
        <p className="text-gray-600 mt-2">
          Here&apos;s an overview of your projects and recent activity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Active Projects
          </h3>
          <p className="text-3xl font-bold text-blue-600">3</p>
          <p className="text-gray-600 text-sm mt-1">
            Projects currently in progress
          </p>
        </div>

        <FeatureGate flag="quality_module">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Pending Inspections
            </h3>
            <p className="text-3xl font-bold text-orange-600">12</p>
            <p className="text-gray-600 text-sm mt-1">
              Inspections requiring attention
            </p>
          </div>
        </FeatureGate>

        <FeatureGate flag="quality_module">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Completed Lots
            </h3>
            <p className="text-3xl font-bold text-green-600">8</p>
            <p className="text-gray-600 text-sm mt-1">
              Lots ready for handover
            </p>
          </div>
        </FeatureGate>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Projects
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">Highway Extension Project</p>
                <p className="text-sm text-gray-600">Updated 2 hours ago</p>
              </div>
              <Link
                href="/app/projects/project-1/overview"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View →
              </Link>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">Bridge Construction</p>
                <p className="text-sm text-gray-600">Updated 1 day ago</p>
              </div>
              <Link
                href="/app/projects/project-2/overview"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View →
              </Link>
            </div>
                    </div>
                  </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/app/projects"
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="text-blue-600 font-medium">View Projects</div>
              <div className="text-sm text-blue-500">Manage all projects</div>
            </Link>

            <Link
              href="/app/account"
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="text-green-600 font-medium">Account</div>
              <div className="text-sm text-green-500">Update settings</div>
            </Link>

            <Link
              href="/app/qse"
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="text-purple-600 font-medium">QSE</div>
              <div className="text-sm text-purple-500">Corporate docs</div>
            </Link>

            <Link
              href="/portal/projects"
              className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="text-orange-600 font-medium">Client Portal</div>
              <div className="text-sm text-orange-500">Client access</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}