import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@/lib/prisma'
import { Adapter } from 'next-auth/adapters'
import NextAuth from 'next-auth'

export const { 
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [

  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    }
  }
})
