import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyAdmin } from '../../../lib/db';

export default NextAuth({
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        console.log('Authorizing with credentials:', credentials);
        const user = await verifyAdmin(credentials.id, credentials.password);
        if (user) {
          console.log('User verified:', user);
          return user;
        } else {
          console.log('Invalid credentials');
          throw new Error('Invalid credentials');
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    }
  }
});