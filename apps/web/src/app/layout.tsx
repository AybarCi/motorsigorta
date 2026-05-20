import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MetaPixel from "@/components/MetaPixel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sigomax | Türkiye'nin En Hızlı Sigorta Karşılaştırma Platformu",
  description: "İhtiyacınıza en uygun sigorta tekliflerini lisanslı acentelerden saniyeler içinde alın, karşılaştırın ve WhatsApp üzerinden uzmanımızla görüşün.",
  keywords: ["sigorta", "kasko", "trafik sigortası", "dask", "sağlık sigortası", "sigorta teklifi", "en uygun sigorta"],
  openGraph: {
    title: "Sigomax | Sigorta Karşılaştırma Platformu",
    description: "Saniyeler içinde en uygun sigorta teklifini al ve WhatsApp'tan uzmanımızla görüş.",
    url: "https://motorsigorta-12dlq75kj-cihans-projects-a0212235.vercel.app", // Fallback URL
    siteName: "Sigomax",
    images: [
      {
        url: "/og-image.jpg", // This will be the OG image
        width: 1200,
        height: 630,
        alt: "Sigomax - Hızlı Sigorta Teklifi",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sigomax | Hızlı Sigorta Teklifi",
    description: "Saniyeler içinde en uygun sigorta teklifini al ve WhatsApp'tan uzmanımızla görüş.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
