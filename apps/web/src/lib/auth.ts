import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcrypt'
import { pool } from '@/lib/db'

const prisma = new PrismaClient()

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { accounts: true, sessions: true }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await compare(credentials.password as string, user.password || '')

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Prefer a stable UUID from auth.users. Create if missing.
      try {
        const email = (user as any)?.email || (token as any)?.email
        if (email) {
          const result = await pool.query<{ id: string }>(
            `WITH existing AS (
               SELECT id FROM auth.users WHERE email = $1 LIMIT 1
             ), created AS (
               INSERT INTO auth.users (id, email, password_hash)
               SELECT gen_random_uuid(), $1, NULL
               WHERE NOT EXISTS (SELECT 1 FROM existing)
               RETURNING id
             )
             SELECT id FROM created
             UNION ALL
             SELECT id FROM existing
             LIMIT 1;`,
            [email as string]
          )
          const authUserId = result.rows[0]?.id
          if (authUserId) {
            ;(token as any).id = authUserId
            ;(token as any).authUserId = authUserId
          }
        }
      } catch {
        // Fallback silently to default token.id
        if (user && (user as any).id) {
          ;(token as any).id = (user as any).id
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        ;(session.user as any).id = (token as any).id as string
        ;(session.user as any).authUserId = (token as any).authUserId as string | undefined
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
})

// Compatibility view for auth.users
export async function createAuthUsersView() {
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE VIEW auth.users AS
    SELECT
      u.id,
      u.email AS email,
      to_jsonb(u.*) AS raw_user_meta_data,
      '{}'::jsonb AS raw_app_meta_data,
      u.created_at,
      u.updated_at
    FROM public.users u;
  `)
}
