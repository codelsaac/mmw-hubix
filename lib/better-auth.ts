import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";

import { prisma } from "@/lib/prisma";

// Better Auth server instance.
// This is the single entry-point for authentication on the server.
export const auth = betterAuth({
  basePath: "/api/better-auth",
  // Reuse existing NextAuth-compatible Prisma schema (User, Account, Session, VerificationToken)
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  // Map existing NextAuth Prisma fields to Better Auth’s expectations
  user: {
    additionalFields: {
      role: {
        type: "string",
      },
      permissions: {
        type: "string",
      },
      displayUsername: {
        type: "string",
        required: false,
      },
    },
  },
  session: {
    fields: {
      expiresAt: "expires",
      token: "sessionToken",
    },
  },
  account: {
    fields: {
      accountId: "providerAccountId",
      refreshToken: "refresh_token",
      accessToken: "access_token",
      idToken: "id_token",
    },
  },

  // Use cookies integration for Next.js App Router
  plugins: [
    nextCookies(),
    username(),
  ],
});



