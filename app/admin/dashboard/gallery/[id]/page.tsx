import AlbumManager from "@/components/admin/AlbumManager";

export default function AlbumDetailPage({ params }: { params: { id: string } }) {
  return <AlbumManager albumId={params.id} />;
}
