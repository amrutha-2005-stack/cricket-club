import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import FormerPlayerForm from "@/components/admin/FormerPlayerForm";

export default async function EditFormerPlayerPage({ params }: { params: { id: string } }) {
  const player = await prisma.formerPlayer.findUnique({ where: { id: params.id } });
  if (!player) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-navy-950">Edit Former Player</h1>
      <FormerPlayerForm
        playerId={player.id}
        initialValues={{
          name: player.name,
          photoUrl: player.photoUrl || "",
          playingYears: player.playingYears || "",
          role: player.role || "",
          bio: player.bio || "",
          achievements: player.achievements || "",
          jerseyNumber: player.jerseyNumber?.toString() || "",
        }}
      />
    </div>
  );
}
