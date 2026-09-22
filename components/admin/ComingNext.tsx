export default function ComingNext({ title, note }: { title: string; note?: string }) {
  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-navy-950">{title}</h1>
      <div className="mt-6 rounded-xl border border-dashed border-navy-950/15 bg-white p-8 text-sm text-navy-950/60">
        <p className="font-semibold text-navy-950">This management screen is built in the next pass.</p>
        <p className="mt-2">
          It follows the exact same pattern already working for <strong>Achievements</strong> (list, create, edit,
          delete, reorder, image upload) — the database model for this section already exists in{" "}
          <code className="rounded bg-navy-950/5 px-1">prisma/schema.prisma</code>, so wiring the admin screen and
          public display is the remaining step.
        </p>
        {note && <p className="mt-2">{note}</p>}
      </div>
    </div>
  );
}
