import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import StatsBar from "@/components/site/StatsBar";
import AboutEventsNews from "@/components/site/AboutEventsNews";
import QuoteBanner from "@/components/site/QuoteBanner";
import Founders from "@/components/site/Founders";
import Achievements from "@/components/site/Achievements";
import Tournaments from "@/components/site/Tournaments";
import HistoricalStorySection from "@/components/site/HistoricalStorySection";
import GalleryPreview from "@/components/site/GalleryPreview";
import Videos from "@/components/site/Videos";
import FormerPlayers from "@/components/site/FormerPlayers";
import CurrentPlayers from "@/components/site/CurrentPlayers";
import Contact from "@/components/site/Contact";
import Footer from "@/components/site/Footer";

export default async function HomePage() {
  const socials = await prisma.socialLink.findMany().catch(() => []);
  const socialLinks = Object.fromEntries(socials.filter((s) => s.url).map((s) => [s.platform, s.url]));

  return (
    <>
      <Navbar socialLinks={socialLinks} />
      <Hero />
      <StatsBar />
      <AboutEventsNews />
      <QuoteBanner />
      <Founders />
      <Achievements />
      <Tournaments />
      <HistoricalStorySection />
      <GalleryPreview />
      <Videos />
      <FormerPlayers />
      <CurrentPlayers />
      <Contact />
      <Footer />
    </>
  );
}


