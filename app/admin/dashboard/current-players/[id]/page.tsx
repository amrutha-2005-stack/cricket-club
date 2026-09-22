import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import CurrentPlayerForm from "@/components/admin/CurrentPlayerForm";

export default async function EditCurrentPlayerPage({ params }: { params: { id: string } }) {
  const player = await prisma.currentPlayer.findUnique({ where: { id: params.id } });
  if (!player) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-navy-950">Edit Current Player</h1>
      <CurrentPlayerForm
        playerId={player.id}
        initialValues={{
          name: player.name,
          photoUrl: player.photoUrl || "",
          jerseyNumber: player.jerseyNumber?.toString() || "",
          role: player.role || "",
          battingStyle: player.battingStyle || "",
          bowlingStyle: player.bowlingStyle || "",
          bio: player.bio || "",
          socialLink: player.socialLink || "",
        }}
      />
    </div>
  );
}
