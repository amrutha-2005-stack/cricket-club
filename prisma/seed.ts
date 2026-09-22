// Seeds the database with:
//  1. The first admin account (from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD)
//  2. A SiteSettings singleton row with sane, honest defaults (no invented stats)
//  3. Default (empty-URL) social links, so the admin dashboard has rows to edit
//
// Safe to re-run: everything here is an upsert.
//
// Usage: npm run seed

import { PrismaClient, SocialPlatform } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in your .env file first.");
  }
  if (password.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD should be at least 8 characters.");
  }

  const passwordHash = await hashPassword(password);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });
  console.log(`Admin account ready: ${email}`);
  console.log("IMPORTANT: change this password after your first login if it's the sample \"ChangeMe123!\" value.");

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteTitle: "Bengaluru Friends | Since 1994",
      metaDescription:
        "Bengaluru Friends – A cricket and sports association with a rich journey since 1994.",
      tagline: "A cricket and sports association built on friendship, since 1994.",
      topBarTagline: "More Than a Team, We Are a Family",
      bannerQuote: "Different People. Same Passion.",
      email: "bengalurufriends1994@gmail.com",
      foundedYear: 1994,
      // totalTournaments / totalChampionships intentionally left null —
      // exact figures were not provided. Fill these in from /admin/dashboard
      // once confirmed, and they'll appear in the homepage stats bar.
    },
  });
  console.log("Site settings ready (edit real numbers from the admin dashboard).");

  const SOCIAL_DEFAULTS: Partial<Record<SocialPlatform, string>> = {
    INSTAGRAM: "https://www.instagram.com/bangalurufriends?stkn=MXQ2M20yMDNtbW50aA==",
    YOUTUBE: "https://www.youtube.com/@kiran1990-k2v?si=BwRak6twM8fbnORQ",
    FACEBOOK: "https://www.facebook.com/share/1CDbgCj2rf/?mibextid=wwXIfr",
  };

  for (const platform of Object.values(SocialPlatform)) {
    await prisma.socialLink.upsert({
      where: { platform },
      update: {},
      create: { platform, url: SOCIAL_DEFAULTS[platform] || "" },
    });
  }
  console.log("Social link rows ready (Instagram, YouTube and Facebook pre-filled; WhatsApp blank until provided).");

  // Founders — photo-to-name mapping is exact and must never be swapped:
  // /public/images/founder-renu-gowda.jpg  -> Renu Gowda
  // /public/images/founder-kiran-gowda.jpg -> Kiran Gowda
  const FOUNDERS = [
    { name: "Renu Gowda", designation: "Founder", photoUrl: "/images/founder-renu-gowda.jpg", order: 0 },
    { name: "Kiran Gowda", designation: "Founder", photoUrl: "/images/founder-kiran-gowda.jpg", order: 1 },
  ];

  for (const founder of FOUNDERS) {
    const existing = await prisma.founder.findFirst({ where: { name: founder.name } });
    if (existing) {
      await prisma.founder.update({ where: { id: existing.id }, data: founder });
    } else {
      await prisma.founder.create({ data: founder });
    }
  }
  console.log("Founders ready: Renu Gowda, Kiran Gowda (edit bio/message from the admin dashboard).");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
