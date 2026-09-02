"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Event } from "@gcc-portal/contracts";
import { useAuth } from "@/contexts/AuthContext";

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";
        const res = await fetch(`${apiUrl}/events`, {
          credentials: "include",
        });
        if (res.ok) {
          const payload = await res.json() as { success: boolean; data: Event[] };
          setEvents(payload.data);
        } else {
          setError(new Error("Failed to load events"));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An error occurred"));
      } finally {
        setIsLoading(false);
      }
    };
    void fetchEvents();
  }, []);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const handleRegistration = async (eventId: string, isRegistered: boolean) => {
    if (!user) {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787"}/auth/login`;
      return;
    }

    try {
      setRegisteringId(eventId);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";
      const method = isRegistered ? "DELETE" : "POST";
      const res = await fetch(`${apiUrl}/events/${eventId}/registrations`, {
        method,
        credentials: "include",
      });

      if (res.ok) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId ? { ...e, is_registered: !isRegistered } : e
          )
        );
      }
    } catch (error) {
      console.error("Failed to update registration", error);
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <section
      id="events"
      className="relative min-h-screen overflow-hidden bg-[#050608] px-6 py-24 text-white md:px-12 lg:px-20"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-[#68d32f]/10 blur-[140px]" />

      <div className="relative mx-auto max-w-[1400px]">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-[#68d32f]">
            Events
          </p>

          <h2 className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-7xl lg:text-[6rem]">
            CONNECT.
            <br />
            <span className="text-[#68d32f]">COLLABORATE.</span>
          </h2>

          <p className="mt-8 max-w-2xl text-base leading-7 text-white/55 md:text-lg">
            Discover events, workshops and experiences that bring our
            community together and create meaningful global connections.
          </p>
        </motion.div>

        {/* Events */}
        {isLoading ? (
          <div className="mt-20 flex justify-center text-white/50">Loading events...</div>
        ) : error ? (
          <div className="mt-20 flex justify-center text-red-500/50">Failed to load events.</div>
        ) : events.length === 0 ? (
          <div className="mt-20 flex justify-center text-white/50">No events currently scheduled.</div>
        ) : (
          <div className="mt-20 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event, index) => (
            <motion.article
              key={event.id}
              data-cursor="VIEW"
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  transition: { duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] } 
                },
                hover: {
                  y: -6,
                  borderColor: "rgba(104, 211, 47, 0.4)",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
                }
              }}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true, margin: "-50px" }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 cursor-pointer"
            >
              {/* Number */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/35">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <motion.span 
                  variants={{
                    hidden: { opacity: 0, scale: 0.5 },
                    visible: { opacity: 0, scale: 0.5 },
                    hover: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
                  }}
                  className="h-2 w-2 rounded-full bg-[#68d32f]" 
                />
              </div>

              {/* Content */}
              <div className="mt-16">
                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#68d32f]">
                  {formatDate(event.date)}
                </p>

                <h3 className="text-2xl font-medium tracking-tight md:text-3xl">
                  {event.title}
                </h3>

                <motion.p 
                  variants={{
                    hover: { color: "rgba(255, 255, 255, 0.7)" }
                  }}
                  className="mt-4 text-sm leading-6 text-white/50"
                >
                  {event.description ?? "No description available."}
                </motion.p>
              </div>

              {/* Action */}
              <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleRegistration(event.id, !!event.is_registered);
                  }}
                  disabled={registeringId === event.id}
                  className={`text-sm transition-colors ${
                    event.is_registered 
                      ? "text-[#68d32f] hover:text-red-500" 
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  {registeringId === event.id
                    ? "Updating..."
                    : event.is_registered
                    ? "Registered (Click to cancel)"
                    : "Register for event"}
                </button>

                <motion.span 
                  variants={{
                    hover: { x: 6, color: "#68d32f", transition: { duration: 0.3 } }
                  }}
                  className="text-xl"
                >
                  →
                </motion.span>
              </div>
            </motion.article>
          ))}
          </div>
        )}
      </div>
    </section>
  );
}
