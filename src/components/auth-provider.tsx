"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const validateSession = useAuthStore((state) => state.validateSession);

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  return <>{children}</>;
}
