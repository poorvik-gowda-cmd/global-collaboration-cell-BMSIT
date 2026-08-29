export default function JoinPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-4xl">

          <p className="mb-6 text-sm tracking-[0.35em] text-[#68d32f]">
            GLOBAL COLLABORATION CELL
          </p>

          <h1 className="text-7xl font-bold uppercase leading-[0.85] md:text-9xl">
            JOIN
            <br />
            <span className="text-[#68d32f]">GCC.</span>
          </h1>

          <p className="mt-10 max-w-xl text-lg leading-8 text-white/60">
            Become a member of the Global Collaboration Cell and
            connect with students, creators and organizations across
            borders.
          </p>

          <a
            href="/"
            className="mt-10 inline-block rounded-full border border-white/20 px-7 py-4 transition-all duration-300 hover:border-[#68d32f] hover:bg-[#68d32f] hover:text-black"
          >
            ← Back to Home
          </a>

        </div>
      </div>
    </main>
  );
}