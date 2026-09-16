import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { CartHydration } from "@/components/CartHydration";
import { ServiceWorker } from "@/components/ServiceWorker";
import { AppFrame } from "@/components/AppFrame";

const display = Fraunces({
  variable: "--font-display-src",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sans = Manrope({
  variable: "--font-sans-src",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Granja Canaã · Ovos caipiras",
  description:
    "Ovos caipiras da Granja Canaã com entrega em Canaã dos Carajás. Peça em poucos toques, de terça a domingo, das 08h às 16h.",
  applicationName: "Granja Canaã",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Granja Canaã",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // A interface desenha sob as barras do sistema; o respiro volta via
  // env(safe-area-inset-*) em cada superfície fixa.
  viewportFit: "cover",
  themeColor: "#1b281a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable} antialiased`}>
      <body>
        <CartHydration />
        <ServiceWorker />
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
