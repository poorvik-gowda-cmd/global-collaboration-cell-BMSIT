"use client";

import { motion } from "framer-motion";

export default function Collaborations() {
  return (
    <section
      id="collaborations"
      className="relative min-h-screen overflow-hidden bg-[#050608] px-6 py-32 text-white md:px-12 lg:px-20"
    >
      <div className="mx-auto max-w-[1400px]">

        {/* Section label */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-6 text-xs uppercase tracking-[0.3em] text-[#68d32f]"
        >
          Global Network
        </motion.p>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl text-5xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-7xl lg:text-8xl"
        >
          COLLABORATIONS.
          <br />
          <span className="text-[#68d32f]">GLOBAL REACH.</span>
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-8 max-w-2xl text-base leading-7 text-white/55 md:text-lg"
        >
          GCC builds meaningful connections between students, institutions,
          organizations and global partners to create opportunities for
          collaboration and growth.
        </motion.p>

        {/* Collaboration cards */}
        <div className="mt-16 grid gap-5 md:grid-cols-3">

          {[
            {
              number: "01",
              title: "Institutional Partnerships",
              text: "Building strong academic connections with institutions across the world.",
            },
            {
              number: "02",
              title: "Global Organizations",
              text: "Connecting students with organizations, communities and industry partners.",
            },
            {
              number: "03",
              title: "Student Networks",
              text: "Creating a network where students can collaborate, learn and grow together.",
            },
          ].map((item) => (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -5 }}
              className="group border-t border-white/15 pt-6"
            >
              <span className="text-sm text-[#68d32f]">
                {item.number}
              </span>

              <h3 className="mt-5 text-2xl font-medium">
                {item.title}
              </h3>

              <p className="mt-3 max-w-sm text-sm leading-6 text-white/45">
                {item.text}
              </p>

              <div className="mt-8 h-px w-full bg-white/10 transition-all duration-500 group-hover:bg-[#68d32f]" />
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
}