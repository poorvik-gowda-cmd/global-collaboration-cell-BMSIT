import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <h1 className="mb-2 text-6xl font-extrabold text-gray-900">404</h1>
      <p className="mb-6 text-lg text-gray-500">Page not found.</p>
      <Link
        href="/"
        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Back to Home
      </Link>
    </main>
  );
}
