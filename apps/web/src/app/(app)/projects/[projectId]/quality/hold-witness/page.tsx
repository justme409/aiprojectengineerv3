"use client"

import { useParams } from 'next/navigation'
import HoldWitnessRegister from '@/components/features/quality/HoldWitnessRegister'

export default function HoldWitnessPage() {
	const params = useParams()
	const projectId = params.projectId as string
	return <HoldWitnessRegister projectId={projectId} />
}
