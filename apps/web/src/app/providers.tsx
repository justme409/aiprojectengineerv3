"use client"
import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { FeatureFlagProvider } from '@/components/feature-flag-provider'

export function Providers({ children }: { children: ReactNode }) {
	return (
		<SessionProvider>
			<FeatureFlagProvider>
				{children}
			</FeatureFlagProvider>
		</SessionProvider>
	)
}
