import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

// Global Better Auth client for the React side.
// Exposes hooks and helpers similar to next-auth/react.
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? `${window.location.origin}/api/better-auth` : "http://localhost:3000/api/better-auth",
  plugins: [usernameClient()],
});

export const {
  useSession,
  signIn,
  signOut,
} = authClient;


