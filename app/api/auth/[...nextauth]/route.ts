import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Demo user accounts for development
const DEMO_ACCOUNTS = [
  { id: "1", email: "admin@cccmmw.edu.hk", password: "mmw2025", name: "Admin User", role: "admin", department: "Admin" },
  { id: "2", email: "itprefect@cccmmw.edu.hk", password: "prefect123", name: "IT Prefect", role: "user", department: "IT" }
]

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        // Check demo accounts
        const user = DEMO_ACCOUNTS.find(
          account => account.email === credentials.email && account.password === credentials.password
        )
        
        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department
          }
        }
        
        return null
      }
    })
  ],
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.department = token.department;
      return session;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role;
        token.department = user.department;
      }
      return token;
    },
  },
  pages: {
    signIn: '/',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
