"use client";

import { motion } from "framer-motion";

export default function ImpactStats() {
  return (
    <section
      id="impact"
      className="relative bg-[#050608] px-6 py-24 text-white md:px-12 lg:px-20"
    >
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-10 flex items-center gap-4"
        >
          <span className="h-px w-10 bg-[#68d32f]" />

          <span className="text-sm tracking-[0.3em] text-[#68d32f]">
            GLOBAL IMPACT
          </span>
        </motion.div>

        <div className="grid grid-cols-2 border-t border-white/10 md:grid-cols-4">
          {[
            ["1200+", "Members"],
            ["25+", "Institutions"],
            ["40+", "Countries"],
            ["100+", "Projects"],
          ].map(([number, label], index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="border-b border-white/10 px-4 py-10 md:border-b-0 md:border-r md:px-8 md:py-12 last:border-r-0"
            >
              <div className="text-4xl font-medium tracking-tight md:text-6xl">
                {number}
              </div>

              <div className="mt-3 text-sm text-white/40 md:text-base">
                {label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}