"use client";

import type React from "react";
import { SessionProvider as Provider } from "next-auth/react";

export function SessionProvider({ children, session }: { children: React.ReactNode, session: any }) {
  return (
    <Provider session={session}>
      {children}
    </Provider>
  );
}
