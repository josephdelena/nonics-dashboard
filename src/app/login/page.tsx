"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const params = useSearchParams();
  const error = params.get("error");

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0A0A0F", backgroundImage: "radial-gradient(ellipse at 50% 40%, rgba(245,166,35,0.08) 0%, transparent 60%)" }}
    >
      <div className="glass-gold w-full max-w-xs p-8 text-center" style={{ borderColor: "rgba(245,166,35,0.2)" }}>
        {/* Logo */}
        <div className="mb-1">
          <h1 className="text-2xl font-bold tracking-widest flex items-center justify-center gap-2">
            <div className="w-3.5 h-3.5 rotate-45 bg-gradient-to-br from-[#F5A623] to-[#F0C040] shrink-0" />
            <span className="text-[#E8E6E3]">NONICS</span>{" "}
            <span className="shimmer-gold">MANTAP</span>
          </h1>
        </div>
        <p className="text-[10px] text-[#6B6B78] uppercase tracking-[0.2em]">Sales Intelligence Dashboard</p>

        {/* Divider */}
        <div className="border-t border-[rgba(245,166,35,0.1)] my-6" />

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 mb-4">
            <p className="text-red-400 text-sm">
              {error === "AccessDenied" ? "Email tidak terdaftar. Hubungi admin." : "Login gagal. Coba lagi."}
            </p>
          </div>
        )}

        {/* Google Login Button */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 text-[#0A0A0F] font-semibold rounded-xl px-4 py-3 hover:scale-[1.02] hover:shadow-[0_0_32px_rgba(245,166,35,0.25)] transition-all"
          style={{ background: "linear-gradient(135deg, #F5A623, #F0C040)" }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#0A0A0F" fillOpacity=".6"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#0A0A0F" fillOpacity=".7"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#0A0A0F" fillOpacity=".5"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#0A0A0F" fillOpacity=".8"/>
          </svg>
          Login dengan Google
        </button>

        <p className="text-[10px] text-[#6B6B78] tracking-widest mt-6">Akses terbatas &middot; DIMENSI Grup</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0F" }}>
        <div className="spinner-gold" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
