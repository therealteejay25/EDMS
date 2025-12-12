import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl flex flex-col items-center justify-center">
      <div className="my-16 rounded-lg  p-8 text-center shadow-sm">
        <h1 className="text-3xl font-semibold text-gray-50">Welcome to Zentra</h1>
        <p className="mt-3 text-zinc-600">
          A dynamic frontend for an Electronic Document Management System.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/login"
            className="rounded-md bg-orange-600 px-6 py-3.5 text-md font-semibold text-white"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
