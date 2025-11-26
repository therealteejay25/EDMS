import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="my-16 rounded-lg border border-zinc-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-semibold">Welcome to EDMS</h1>
        <p className="mt-3 text-zinc-600">
          A static frontend for an Electronic Document Management System.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/login"
            className="rounded-md bg-sky-600 px-4 py-2 text-sm text-white"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
