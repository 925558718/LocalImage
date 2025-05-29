import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSS Gradient Generator - Create Beautiful Gradients with Tailwind Support | LocalImage",
  description: "Free online CSS gradient generator with live preview, Tailwind CSS support, and copy-ready code. Create beautiful linear and radial gradients for your web projects.",
  keywords: "css gradient, gradient generator, tailwind gradients, linear gradient, radial gradient, css tools, web development, color picker",
  openGraph: {
    title: "CSS Gradient Generator - LocalImage",
    description: "Create beautiful CSS gradients with live preview and Tailwind support",
    type: "website",
    url: "https://www.limgx.com/dev/gradient",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSS Gradient Generator - LocalImage",
    description: "Create beautiful CSS gradients with live preview and Tailwind support",
  },
};

export default function GradientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 