import type { Metadata, Viewport } from "next";
import {
  EB_Garamond,
  Cormorant_Garamond,
  Tiro_Devanagari_Hindi,
} from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import "./globals.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-eb-garamond",
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// Devanagari display face — the tradition's own script, used for numerals,
// section marks, and sacred nouns. Latin reads the prose; Devanagari the soul.
const tiroDevanagari = Tiro_Devanagari_Hindi({
  subsets: ["devanagari", "latin"],
  display: "swap",
  variable: "--font-deva",
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Kathak Journal — A Sacred Archive for Your Dance Journey",
  description:
    "Preserve compositions, riyaz, performances, and guru wisdom in one timeless manuscript.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Kathak Journal",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#6B1E2A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#6B1E2A",
          colorBackground: "#FAF6EC",
          colorText: "#1c1c16",
          colorTextSecondary: "#554243",
          colorInputBackground: "#FAF6EC",
          colorInputText: "#1c1c16",
          colorDanger: "#ba1a1a",
          colorSuccess: "#7e570d",
          fontFamily: "EB Garamond, Garamond, serif",
          borderRadius: "0",
        },
        elements: {
          card: "bg-surface border border-secondary",
          headerTitle: "font-display text-primary text-headline-lg",
          headerSubtitle:
            "font-serif italic text-on-surface-variant",
          formButtonPrimary:
            "bg-primary text-on-primary uppercase tracking-widest font-serif text-label-md rounded-none hover:bg-primary-container",
          socialButtonsBlockButton:
            "border border-secondary rounded-none",
          footerActionLink: "text-primary hover:text-primary-container",
        },
      }}
    >
      <html
        lang="en"
        className={`${ebGaramond.variable} ${cormorant.variable} ${tiroDevanagari.variable}`}
      >
        <body>
          {children}
          <ServiceWorkerRegistrar />
        </body>
      </html>
    </ClerkProvider>
  );
}
