/**
 * Landing page — GCC Portal
 *
 * This is a placeholder landing page. No GCC business features are implemented yet.
 * Replace this content with the actual design once requirements are finalised.
 */
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-violet-50 px-6">
      {/* Hero section */}
      <section className="w-full max-w-3xl text-center">
        <div className="mb-6 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
          🚀 Coming Soon
        </div>

        <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Global Collaboration Cell
        </h1>

        <p className="mb-2 text-xl font-semibold text-blue-700">
          BMS Institute of Technology and Management
        </p>

        <p className="mb-10 text-lg text-gray-600">
          The official platform for GCC BMSIT is under development. Stay tuned
          for events, opportunities, and more.
        </p>

        {/* Status badges */}
        <div className="flex flex-wrap justify-center gap-3">
          <StatusBadge label="Platform" status="In Development" />
          <StatusBadge label="Authentication" status="Planned" />
          <StatusBadge label="Events" status="Planned" />
          <StatusBadge label="Opportunities" status="Planned" />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-gray-400">
        <p>
          &copy; {new Date().getFullYear()} Global Collaboration Cell, BMSIT.
          All rights reserved.
        </p>
      </footer>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Local sub-components — move to packages/ui once design is finalised */
/* ------------------------------------------------------------------ */

interface StatusBadgeProps {
  label: string;
  status: string;
}

function StatusBadge({ label, status }: StatusBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 shadow-sm">
      <span className="font-medium">{label}:</span>
      <span className="text-gray-500">{status}</span>
    </span>
  );
}
