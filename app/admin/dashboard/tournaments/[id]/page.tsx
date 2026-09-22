import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import TournamentForm from "@/components/admin/TournamentForm";

export default async function EditTournamentPage({ params }: { params: { id: string } }) {
  const tournament = await prisma.tournament.findUnique({ where: { id: params.id } });
  if (!tournament) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-navy-950">Edit Tournament</h1>
      <TournamentForm
        tournamentId={tournament.id}
        initialValues={{
          name: tournament.name,
          year: tournament.year?.toString() || "",
          location: tournament.location || "",
          description: tournament.description || "",
          winner: tournament.winner || "",
          runnerUp: tournament.runnerUp || "",
          numberOfTeams: tournament.numberOfTeams?.toString() || "",
          posterUrl: tournament.posterUrl || "",
          date: tournament.date ? tournament.date.toISOString().slice(0, 10) : "",
          status: tournament.status,
        }}
      />
    </div>
  );
}
