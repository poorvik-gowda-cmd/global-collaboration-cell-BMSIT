"use client";

import { motion } from "framer-motion";

export default function Contact() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[#050608] px-6 py-28 text-white md:px-12 lg:px-20"
    >
      <div className="pointer-events-none absolute right-[-200px] top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[#68d32f]/10 blur-[160px]" />

      <div className="relative mx-auto max-w-[1400px]">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-5 flex items-center gap-4"
        >
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#68d32f]">
            Get in touch
          </span>

          <div className="h-px flex-1 bg-white/10" />
        </motion.div>

        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr]">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-5xl font-semibold uppercase leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-8xl">
              Let's
              <br />
              <span className="text-[#68d32f]">Connect.</span>
            </h2>

            <p className="mt-8 max-w-lg text-base leading-7 text-white/50">
              Have an idea, collaboration proposal or opportunity?
              Connect with the Global Collaboration Cell and let's
              create something meaningful together.
            </p>

            <div className="mt-10 space-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                  Email
                </p>
                <p className="mt-1 text-lg text-white/80">
                  gcc@bsmit.in
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                  Location
                </p>
                <p className="mt-1 text-lg text-white/80">
                  BMS Institute of Technology and Management
                  Bengaluru, Karnataka
                </p>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 md:p-8"
          >
            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-xs text-white/40">
                  Name
                </label>

                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full border-b border-white/15 bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#68d32f]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-white/40">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full border-b border-white/15 bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#68d32f]"
                />
              </div>

            </div>

            <div className="mt-8">
              <label className="mb-2 block text-xs text-white/40">
                Subject
              </label>

              <input
                type="text"
                placeholder="How can we collaborate?"
                className="w-full border-b border-white/15 bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#68d32f]"
              />
            </div>

            <div className="mt-8">
              <label className="mb-2 block text-xs text-white/40">
                Message
              </label>

              <textarea
                rows={5}
                placeholder="Tell us about your idea..."
                className="w-full resize-none border-b border-white/15 bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#68d32f]"
              />
            </div>

            <button
              type="submit"
              className="mt-8 flex items-center gap-8 rounded-full bg-[#68d32f] px-7 py-3 text-sm font-medium text-black transition hover:scale-[1.02]"
            >
              Send Message
              <span className="text-lg">→</span>
            </button>
          </motion.form>
        </div>

        {/* Bottom */}
        <div className="mt-20 border-t border-white/10 pt-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/30">
            Global Collaboration Cell · BSMIT
          </p>
        </div>

      </div>
    </section>
  );
}