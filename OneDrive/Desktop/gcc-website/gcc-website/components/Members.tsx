"use client";

import Image from "next/image";
import { members } from "@/data/members";

export default function Members() {
  return (
    <section
      id="members"
      className="relative px-6 py-24 md:px-10 lg:px-20"
    >
      {/* Header */}
      <div className="mb-16 grid gap-10 lg:grid-cols-2">
        <div>
          <p className="mb-5 text-sm font-medium uppercase tracking-[0.25em] text-[#5eea19]">
            Members
          </p>

          <h2 className="text-6xl font-bold uppercase leading-[0.85] tracking-[-0.05em] text-white md:text-7xl lg:text-8xl">
            Our
            <br />
            <span className="text-[#5eea19]">Members.</span>
          </h2>
        </div>

        <div className="flex items-end">
          <p className="max-w-xl text-base leading-8 text-white/55 md:text-lg">
            Meet the students, leaders and creators building the Global
            Collaboration Cell and creating meaningful impact across borders.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-14 flex flex-wrap gap-3">
        <button className="rounded-full bg-[#5eea19] px-7 py-4 text-sm font-medium text-black">
          Executive Council
        </button>

        <button className="rounded-full border border-white/15 px-7 py-4 text-sm text-white/80 transition hover:border-[#5eea19]">
          Department Leads
        </button>

        <button className="rounded-full border border-white/15 px-7 py-4 text-sm text-white/80 transition hover:border-[#5eea19]">
          All Members
        </button>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {members.map((member) => (
          <article
            key={member.name}
            className="group overflow-hidden rounded-2xl border border-white/10 bg-[#080b09]"
          >
            {/* Photo */}
            <div className="relative h-[420px] overflow-hidden bg-[#101310]">
              <Image
                src={member.image}
                alt={member.name}
                fill
                priority
                className="object-cover object-center transition duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
              />

              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050605] via-transparent to-transparent" />
            </div>

            {/* Info */}
            <div className="p-6">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#5eea19]">
                GCC
              </p>

              <h3 className="text-2xl font-medium text-white">
                {member.name}
              </h3>

              <p className="mt-2 text-sm text-white/45">
                {member.role}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}