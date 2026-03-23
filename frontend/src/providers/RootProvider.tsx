"use client";

import { PropsWithChildren } from "react";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { WorkProvider } from "@/providers/WorkProvider";
import { NotificationProvider } from "@/providers/NotificationProvider";

export function RootProvider({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <QueryProvider>
          <AuthProvider>
            <WorkProvider>{children}</WorkProvider>
          </AuthProvider>
        </QueryProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
