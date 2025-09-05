"use client"

import { useSession, signOut as nextAuthSignOut } from "next-auth/react"

export function useAuth() {
  const { data: session, status } = useSession()

  const user = session?.user
  const isLoading = status === "loading"
  const isAuthenticated = !!user

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: "/" })
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    signOut,
  }
}
