import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSS Gradient Generator - LocalImage | Create Beautiful Gradients with Tailwind Support",
  description: "Free online CSS gradient generator with live preview, Tailwind CSS v3/v4 support, and copy-ready code. Create beautiful linear and radial gradients for your web projects with real-time editing.",
  keywords: "css gradient, gradient generator, tailwind gradients, linear gradient, radial gradient, css tools, web development, color picker, gradient maker, tailwind css, css generator",
  authors: [{ name: "limgx.com" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "CSS Gradient Generator - LocalImage | Create Beautiful Gradients",
    description: "Free online CSS gradient generator with live preview, Tailwind CSS support, and copy-ready code. Create beautiful linear and radial gradients for your web projects.",
    type: "website",
    url: "https://www.limgx.com/dev/gradient",
    images: ["https://www.limgx.com/images/gradient-generator-preview.jpg"],
    siteName: "LocalImage CSS Gradient Generator",
    locale: "en_US",
    alternateLocale: ["zh_CN", "ja_JP", "es_ES", "fr_FR", "de_DE"],
  },
  twitter: {
    card: "summary_large_image",
    title: "CSS Gradient Generator - LocalImage | Create Beautiful Gradients",
    description: "Free online CSS gradient generator with live preview and Tailwind CSS support for web developers.",
    images: ["https://www.limgx.com/images/gradient-generator-preview.jpg"],
    creator: "@limgx_official",
  },
  alternates: {
    canonical: "https://www.limgx.com/dev/gradient",
  }
};

export default function GradientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 