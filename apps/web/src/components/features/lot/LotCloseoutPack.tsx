'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function LotCloseoutPack() {
  const params = useParams()
  const projectId = (params as any)?.projectId as string | undefined
  const lotId = (params as any)?.lotId as string | undefined

  const href = projectId && lotId
    ? `/app/projects/${projectId}/lots/${lotId}/closeout`
    : '/app/projects'

  return (
    <div className="p-4">
      <p className="mb-2">Open the Lot Closeout page:</p>
      <Link className="text-blue-600 underline" href={href}>{href}</Link>
    </div>
  )
}

