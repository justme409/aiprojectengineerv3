"use client"
import { ReactNode } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'

interface AppLayoutClientProps {
  children: ReactNode
}

export default function AppLayoutClient({ children }: AppLayoutClientProps) {
  return (
    <AppLayout>
      {children}
    </AppLayout>
  )
}
