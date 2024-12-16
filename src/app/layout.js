import { Noto_Sans_JP, Roboto } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";

import { NavigationEvents } from "@/components/navigation-events";
import Script from "next/script";

const roboto = Roboto({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
  variable: "--font-roboto",
});

export const notoSansJP = Noto_Sans_JP({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
});

export const metadata = {
  title: "AI Companion",
  description: "3d and 2d AI companion expresiens ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${roboto.variable} ${notoSansJP.variable}`}>
      <body className={roboto.className}>
        <Script src="/live2dcubismcore.js" strategy="beforeInteractive" />
        {children}
        <Suspense fallback={null}>
          <NavigationEvents />
        </Suspense>
      </body>
    </html>
  );
}
