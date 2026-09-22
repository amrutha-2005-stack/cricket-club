import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import VideoForm from "@/components/admin/VideoForm";

export default async function EditVideoPage({ params }: { params: { id: string } }) {
  const video = await prisma.video.findUnique({ where: { id: params.id } });
  if (!video) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-navy-950">Edit Video</h1>
      <VideoForm
        videoId={video.id}
        initialValues={{
          title: video.title,
          youtubeUrl: video.youtubeUrl,
          description: video.description || "",
          year: video.year?.toString() || "",
          tournamentName: video.tournamentName || "",
          category: video.category || "",
        }}
      />
    </div>
  );
}
