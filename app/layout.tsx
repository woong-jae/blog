import "./globals.css";
import { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import userConfig from "@/user.config.json";
import Script from "next/script";

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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 duration-200 min-h-screen">
          <div className="mx-auto max-w-3xl">
            <Header title={userConfig.title} />
            <main className="px-4">{children}</main>
            <Footer name={userConfig.name} />
          </div>
        </div>
      </body>
      <Script
        id="google-tag"
        src="https://www.googletagmanager.com/gtag/js?id=G-X4R5X2W9YF"
        strategy="afterInteractive"
      >{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-X4R5X2W9YF');
      `}</Script>
    </html>
  );
}
