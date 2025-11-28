import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/better-auth";

// Better Auth catch-all handler for auth-related routes.
// This will live alongside the existing NextAuth handler during migration.
export const { GET, POST } = toNextJsHandler(auth);


