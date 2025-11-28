import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth";

// Rate limiting store (simple in-memory version, use Redis in production for multi-instance)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  
  // 1. Security Headers
  const headers = response.headers;
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.openrouter.ai;"
  );

  // 2. API Route Rate Limiting
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const tm = process.env.TEST_MODE
    const ne = process.env.NODE_ENV
    if (tm === 'true' || ne === 'test') {
      return response
    }
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 100; // 100 requests per minute per IP

    const limitData = rateLimitMap.get(ip);

    if (limitData && now < limitData.resetTime) {
      if (limitData.count >= maxRequests) {
        return NextResponse.json(
          { error: 'Too many requests, please try again later.' },
          { status: 429, headers: { 'Retry-After': '60' } }
        );
      }
      limitData.count++;
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    }

    // Clean up expired entries to prevent memory leak
    if (rateLimitMap.size > 10000) {
      for (const [key, value] of rateLimitMap.entries()) {
        if (now > value.resetTime) {
          rateLimitMap.delete(key);
        }
      }
    }
  }

  // 3. Admin Route Protection
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    if ((session.user as any).role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/admin/:path*",
  ],
};
