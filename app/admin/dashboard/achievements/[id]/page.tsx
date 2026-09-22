import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import AchievementForm from "@/components/admin/AchievementForm";

export default async function EditAchievementPage({ params }: { params: { id: string } }) {
  const achievement = await prisma.achievement.findUnique({ where: { id: params.id } });
  if (!achievement) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-navy-950">Edit Achievement</h1>
      <AchievementForm
        achievementId={achievement.id}
        initialValues={{
          title: achievement.title,
          description: achievement.description || "",
          year: achievement.year?.toString() || "",
          tournamentName: achievement.tournamentName || "",
          trophyImageUrl: achievement.trophyImageUrl || "",
          teamPhotoUrl: achievement.teamPhotoUrl || "",
          videoUrl: achievement.videoUrl || "",
        }}
      />
    </div>
  );
}
