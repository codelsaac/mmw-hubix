"use client";

import type React from "react";

export function SessionProvider({ children, session }: { children: React.ReactNode, session: any }) {
  return (
    <>
      {children}
    </>
  );
}
