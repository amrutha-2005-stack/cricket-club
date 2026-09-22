import { prisma } from "@/lib/db";
import ContactForm from "@/components/site/ContactForm";

export default async function Contact() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } }).catch(() => null);

  return (
    <section id="contact" className="bg-navy-950 py-16 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div className="reveal">
          <h2 className="font-display text-3xl font-extrabold">
            Get In Touch
            <span className="mt-2 block h-1 w-14 bg-brand-gold" />
          </h2>

          <div className="mt-8 flex flex-col gap-5 text-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-white/40">Address</p>
              <p className="mt-1">{settings?.address || "To be added from the admin dashboard"}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-white/40">Phone</p>
              <p className="mt-1">{settings?.phone || "To be added from the admin dashboard"}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-white/40">Email</p>
              <p className="mt-1">{settings?.email || "To be added from the admin dashboard"}</p>
            </div>
            {settings?.mapUrl && (
              <a href={settings.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-2 text-brand-gold font-semibold">
                View on Google Maps →
              </a>
            )}
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
