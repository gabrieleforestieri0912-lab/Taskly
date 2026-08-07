import Link from "next/link";

export default function WorkspacePage({ params }) {
  const { id } = params;
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-black">Workspace {id}</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link className="rounded-2xl border border-gray-200 p-5 font-bold hover:border-cyan-300 dark:border-gray-800" href={`/workspace/${id}/board`}>
          Board attività
        </Link>
        <Link className="rounded-2xl border border-gray-200 p-5 font-bold hover:border-cyan-300 dark:border-gray-800" href={`/workspace/${id}/doc/home`}>
          Documento home
        </Link>
      </div>
    </div>
  );
}
