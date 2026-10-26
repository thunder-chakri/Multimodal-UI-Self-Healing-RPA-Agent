import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f5f9" },
    { media: "(prefers-color-scheme: dark)", color: "#060913" },
  ],
};

export const metadata: Metadata = {
  title: "OmniSight - Multimodal UI Self-Healing & RPA Operations Dashboard",
  description: "Real-time operations dashboard for monitoring, controlling, and diagnosing multimodal self-healing RPA agent automations with video replay.",
  keywords: ["RPA", "Multimodal AI", "Self-Healing UI", "Playwright", "Automation Dashboard", "Vision AI"],
  authors: [{ name: "OmniSight Autonomous Systems" }],
  openGraph: {
    title: "OmniSight - Multimodal RPA Dashboard",
    description: "Real-time operations platform for autonomous UI self-healing and workflow execution telemetry.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{const t=localStorage.getItem('omnisight-theme');const d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&d)||(t==='system'&&d)){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');document.documentElement.style.colorScheme='light';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
