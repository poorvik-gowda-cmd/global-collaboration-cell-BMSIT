"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  "About",
  "Events",
  "Opportunities",
  "Collaborations",
  "Members",
  "Contact",
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const loginUrl = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787"}/auth/login`;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 md:px-8">
      <nav
        className="
          mx-auto flex max-w-[1500px] items-center justify-between
          rounded-2xl
          border border-black/[0.12]
          bg-black/[0.38]
          px-5 py-3
          backdrop-blur-2xl
          backdrop-saturate-150
          shadow-[0_8px_40px_rgba(0,0,0,0.45)]
          transition-all duration-300
          md:px-6
        "
      >
        {/* Logo */}
        <Link href="/" className="relative z-50 flex-shrink-0">
          <Image
            src="/images/logo/gcc-logo.png"
            alt="GCC - Global Collaboration Cell"
            width={160}
            height={56}
            className="h-12 w-auto object-contain md:h-14"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="
                relative text-[15px] font-medium text-white/80
                transition-all duration-300
                hover:text-white
                after:absolute after:-bottom-2 after:left-0
                after:h-px after:w-0
                after:bg-[#68d32f]
                after:transition-all after:duration-300
                hover:after:w-full
              "
            >
              {item}
            </a>
          ))}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-10 w-24 animate-pulse rounded-full bg-white/10" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1.5 backdrop-blur-md">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt={user.displayName} className="h-6 w-6 rounded-full" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#68d32f] text-xs font-bold text-black">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-white">{user.displayName}</span>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  void logout();
                }}
                className="
                  rounded-full border border-white/20 bg-white/5 px-4 py-2
                  text-sm font-medium text-white transition-all
                  hover:bg-white/10
                "
              >
                Logout
              </button>
            </div>
          ) : (
            <a
              href={loginUrl}
              className="
                rounded-full border border-[#68d32f]/50 px-4 py-2
                text-sm font-medium text-[#68d32f] transition-all
                hover:bg-[#68d32f]/10
              "
            >
              Login
            </a>
          )}

          {/* Join GCC */}
          <a
            href="/join"
            className="
              hidden rounded-full
              border border-[#68d32f]/70
              bg-[#68d32f]/[0.03]
              px-6 py-2.5
              text-sm font-medium text-white
              backdrop-blur-md
              transition-all duration-300
              hover:border-[#68d32f]
              hover:bg-[#68d32f]
              hover:text-black
              hover:shadow-[0_0_25px_rgba(104,211,47,0.25)]
              md:block
            "
          >
            Join GCC
            <span className="ml-3 text-lg">→</span>
          </a>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="
            absolute left-4 right-4 top-[84px]
            rounded-2xl
            border border-white/[0.12]
            bg-black/[0.65]
            p-6
            shadow-[0_20px_60px_rgba(0,0,0,0.5)]
            backdrop-blur-2xl
            lg:hidden
          "
        >
          <div className="flex flex-col gap-5">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => { setMenuOpen(false); }}
                className="
                  border-b border-white/[0.06]
                  pb-4
                  text-lg
                  font-medium
                  text-white/90
                  transition-colors
                  hover:text-[#68d32f]
                "
              >
                {item}
              </a>
            ))}

            <a
              href="#join"
              onClick={() => { setMenuOpen(false); }}
              className="
                mt-1 rounded-full
                bg-[#68d32f]
                px-6 py-3
                text-center
                font-semibold
                text-black
                transition-all duration-300
                hover:shadow-[0_0_30px_rgba(104,211,47,0.3)]
              "
            >
              Join GCC →
            </a>
          </div>
        </div>
      )}
    </header>
  );
}