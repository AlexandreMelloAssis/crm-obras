import "./globals.css";
import "./daynight.css";
import type { Metadata } from "next";
import { RootProvider } from "@/providers/RootProvider";

export const metadata: Metadata = {
  title: "CRM Obras - Gestão de Obras",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="snow" suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
