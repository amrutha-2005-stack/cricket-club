import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import FounderForm from "@/components/admin/FounderForm";

export default async function EditFounderPage({ params }: { params: { id: string } }) {
  const founder = await prisma.founder.findUnique({ where: { id: params.id } });
  if (!founder) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-navy-950">Edit Founder</h1>
      <FounderForm
        founderId={founder.id}
        initialValues={{
          name: founder.name,
          designation: founder.designation,
          bio: founder.bio || "",
          message: founder.message || "",
          photoUrl: founder.photoUrl || "",
        }}
      />
    </div>
  );
}
