import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Professional Network - Connect & Share",
  description:
    "A professional networking platform to connect with colleagues and share insights",
  keywords: "professional, networking, social, career, posts, community",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" },
  ],
  colorScheme: "light dark",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Base theme color meta tags */}
        <meta name="theme-color" content="#ffffff" />
        <meta
          name="theme-color"
          content="#1f2937"
          media="(prefers-color-scheme: dark)"
        />

        {/* Dark/Light mode switch before rendering */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || 
                    (!('theme' in localStorage) && 
                    window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                  document.querySelector('meta[name="theme-color"]')
                    ?.setAttribute('content', '#1f2937');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.querySelector('meta[name="theme-color"]')
                    ?.setAttribute('content', '#ffffff');
                }
              } catch {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
              {children}
            </div>
          </AuthProvider>
        </ThemeProvider>

        {/* Loading indicator for navigation */}
        <div
          id="loading-bar"
          className="fixed top-0 left-0 w-full h-1 bg-blue-600 scale-x-0 origin-left transition-transform duration-300 z-50"
        ></div>

        {/* Toast container */}
        <div
          id="toast-container"
          className="fixed top-4 right-4 z-50 space-y-2"
        ></div>

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
