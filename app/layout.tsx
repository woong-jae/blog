import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import userConfig from "@/user.config.json";

export const metadata = {
  title: userConfig.title,
  description: userConfig.description,
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
    </html>
  );
}
