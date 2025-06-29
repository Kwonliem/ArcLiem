import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { getRankByPoints } from '@/lib/ranks';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        
        if (!user) {
          throw new Error("USER_NOT_FOUND");
        }
        
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );
        
        
        if (!isPasswordCorrect) {
          throw new Error("Email atau password salah.");
        }
        return user;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      await dbConnect();
      
      if (user || trigger === "update") {
        const userId = user ? user._id : token.id;
        const userFromDb = await User.findById(userId);
        
        if(userFromDb) {
            const rank = getRankByPoints(userFromDb.points || 0);

          
            token.id = userFromDb._id;
            token.name = userFromDb.name;
            token.email = userFromDb.email;
            token.credits = userFromDb.credits || 0; 
            token.points = userFromDb.points || 0;
            token.rank = rank;
        }
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.credits = token.credits;
        session.user.points = token.points;
        session.user.rank = token.rank;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/login' },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
