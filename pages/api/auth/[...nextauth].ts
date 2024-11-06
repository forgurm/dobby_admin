import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import { verifyAdmin } from '../../../lib/db';

export default NextAuth({
  providers: [
    Providers.Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        // Use the verifyAdmin function to authenticate the user
        const user = await verifyAdmin(credentials.username, credentials.password);
        if (user) {
          return { id: user.id, name: user.name };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  }
});