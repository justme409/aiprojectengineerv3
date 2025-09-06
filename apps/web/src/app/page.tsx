import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function HomePage() {
  const session = await auth()

  if (session) {
    redirect('/app/dashboard')
  } else {
    redirect('/about') // Or landing page
  }
}
