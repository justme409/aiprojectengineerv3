import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcrypt'

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
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        ;(session.user as any).id = (token as any).id as string
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
