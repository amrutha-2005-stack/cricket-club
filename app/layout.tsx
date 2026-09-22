import type { Metadata } from "next";
import { Barlow_Condensed, Poppins, Noto_Sans_Kannada } from "next/font/google";
import "./globals.css";
import { prisma } from "@/lib/db";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-barlow",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const notoKannada = Noto_Sans_Kannada({
  subsets: ["kannada"],
  weight: ["500", "700"],
  variable: "--font-kannada",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } }).catch(() => null);

  const title = settings?.siteTitle || "Bengaluru Friends | Since 1994";
  const description =
    settings?.metaDescription ||
    "Bengaluru Friends – A cricket and sports association with a rich journey since 1994.";

  return {
    title,
    description,
    icons: { icon: "/images/logo.jpg" },
    openGraph: {
      title,
      description,
      images: ["/images/logo.jpg"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/logo.jpg"],
    },
    metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlow.variable} ${poppins.variable} ${notoKannada.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
