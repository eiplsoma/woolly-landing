import type React from "react"
import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque, Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import CookieConsent from "@/components/cookie-consent"
import LazyAnimateStyles from "@/components/lazy-animate-styles"
import "./globals.css"

/* Fonts */
const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

/* Viewport */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#E8DCC8",
}

/* Metadata */
export const metadata: Metadata = {
  metadataBase: new URL("https://woollydesign.hu"),

  title: {
    default: "Woolly Design | Kézzel készített gyapjú alkotások",
    template: "%s | Woolly Design",
  },

  description:
    "Kézzel készített angyalkák, tündérek és egyedi gyapjú babák. Természetes anyagok, szeretettel alkotva, hogy meleget és varázslatot vigyenek az otthonodba.",

  applicationName: "Woolly Design",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",

  keywords: [
    "kézzel készített",
    "gyapjú",
    "angyalka",
    "tündér",
    "baba",
    "dekoráció",
    "handmade",
    "magyar kézműves",
    "ajándék",
    "wool art",
  ],

  authors: [{ name: "Woolly Design" }],
  creator: "Woolly Design",
  publisher: "Woolly Design",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  alternates: {
    canonical: "https://woollydesign.hu/",
    languages: {
      hu: "https://woollydesign.hu/",
    },
  },

  openGraph: {
    type: "website",
    locale: "hu_HU",
    url: "https://woollydesign.hu/",
    siteName: "Woolly Design",
    title: "Woolly Design | Kézzel készített gyapjú alkotások",
    description:
      "Egyedi, kézzel készített gyapjú alkotások. Angyalkák, tündérek és babák, amelyek érzelmet és melegséget visznek az otthonodba.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Woolly Design kézzel készített gyapjú alkotások",
      },
    ],
  },


  twitter: {
    card: "summary_large_image",
    title: "Woolly Design | Kézzel készített gyapjú alkotások",
    description:
      "Kézzel készített gyapjú angyalkák, tündérek és babák. Természetes, szeretettel készült alkotások.",
    images: ["/og-image.jpg"],
  },


  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/favicon.png", sizes: "180x180" },
    ],
  },



  manifest: "/site.webmanifest",
  category: "handmade",
}

/* Root layout */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="hu"
      className={`${bricolageGrotesque.variable} ${inter.variable} ${geistMono.variable}`}
    >
      <body className="font-sans antialiased bg-background text-foreground">
        {children}

        {/* Cookie consent banner (bottom-left) */}
        <CookieConsent />

        {/* Load animation styles lazily to avoid blocking render */}
        <LazyAnimateStyles />

        <Analytics />
      </body>
    </html>
  )
}
