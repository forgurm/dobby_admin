import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyAdmin } from '../../../lib/auth';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';
import type { User as NextAuthUser } from 'next-auth';

// Session 타입 확장
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
    }
  }
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        id: { label: "ID", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.id || !credentials?.password) {
          return null;
        }

        const user = await verifyAdmin(credentials.id, credentials.password);
        
        if (user) {
          return {
            id: user.no.toString(),
            name: user.name,
            email: user.emailid,
          };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: NextAuthUser | undefined }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt' as const,
    maxAge: 24 * 60 * 60, // 24 hours
  }
};

export default NextAuth(authOptions);