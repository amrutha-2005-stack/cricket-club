import Image from "next/image";

// quote-banner.jpg already contains "More Than a Team, We Are a Family" baked
// into the artwork — this section deliberately adds no text on top of it.
export default function QuoteBanner() {
  return (
    <section className="relative w-full bg-black">
      <div className="relative aspect-[2560/853] w-full">
        <Image src="/images/quote-banner.jpg" alt="More Than a Team, We Are a Family" fill className="object-cover" />
      </div>
    </section>
  );
}
