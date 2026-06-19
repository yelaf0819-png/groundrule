import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MK Summer Camp 2026 — 그라운드룰 워크숍",
  description: "MK Summer Camp 2026 팀 그라운드룰 만들기 워크숍",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-stone-50 text-stone-900 min-h-screen">{children}</body>
    </html>
  );
}
