import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyAdmin } from '../../../lib/db';
import { User } from 'next-auth';

// Session 타입 확장
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

export default NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        id: { label: "ID", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) return null;
        return authorize(credentials);
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        console.log('Session user:', session.user);
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  }
});

async function authorize(credentials: Record<string, string>): Promise<User | null> {
  console.log('Authorizing with credentials:', credentials);
  const user = await verifyAdmin(credentials.id, credentials.password);

  if (user) {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
    };
  }
  return null;
}