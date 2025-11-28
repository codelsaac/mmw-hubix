import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

// Global Better Auth client for the React side.
// Exposes hooks and helpers similar to next-auth/react.
export const authClient = createAuthClient({
  plugins: [usernameClient()],
});

export const {
  useSession,
  signIn,
  signOut,
} = authClient;


