import "./globals.css";
import { Suspense } from "react";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import dynamic from "next/dynamic";
import Script from "next/script";

import userConfig from "@/user.config.json";
import { GA_TRACKING_ID } from "@/lib/gtag";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export const metadata: Metadata = {
  title: userConfig.title,
  description: userConfig.description,
  authors: [
    {
      name: userConfig.name,
      url: userConfig.url,
    },
  ],
  creator: userConfig.name,
  openGraph: {
    title: userConfig.title,
    description: userConfig.description,
    url: userConfig.url,
    siteName: userConfig.title,
    locale: "ko_KR",
    type: "website",
  },
  other: {
    "google-site-verification": "pAyztDPdpi0aVq9HZX5eyXCyEAUUzZmdeAyCP0pvFKE",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {process.env.NODE_ENV !== "development" && (
        <>
          {/* Global Site Tag (gtag.js) - Google Analytics */}
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
          <Script
            id="gtag-init"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
      <Analytics />
      <GoogleAnalytics />
      <body>
        <div className="bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 duration-200 min-h-screen">
          <div className="mx-auto max-w-3xl">
            <Header title={userConfig.title} />
            <main className="px-4">{children}</main>
            <Footer name={userConfig.name} />
          </div>
        </div>
      </body>
    </html>
  );
}
