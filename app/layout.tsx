import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const userData = {
  title: "햣",
  description: "Frontend Engineer 정재웅",
  name: "woong-jae",
};

export const metadata = {
  title: userData.title,
  description: userData.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 duration-200 min-h-screen">
          <div className="mx-auto max-w-3xl">
            <Header title={userData.title} />
            <main className="px-4">{children}</main>
            <Footer name={userData.name} />
          </div>
        </div>
      </body>
    </html>
  );
}
