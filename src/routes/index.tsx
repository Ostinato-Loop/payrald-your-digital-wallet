import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import payraldLogo from "@/assets/payrald-logo.png";
import payraldMark from "@/assets/payrald-mark.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PayRald — Move money at the speed of Africa" },
      {
        name: "description",
        content:
          "PayRald is the consumer payments app powered by ALIA. Send, receive and pay using just a username, email or phone — no account numbers, ever.",
      },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 350);
    const t2 = setTimeout(() => setPhase(2), 1100);
    const t3 = setTimeout(() => navigate({ to: "/welcome" }), 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [navigate]);

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-background px-6 text-foreground">
      {/* Brand-color orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[15%] top-[18%] h-56 w-56 rounded-full opacity-50 blur-3xl"
        style={{ background: "#e11d2a" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[10%] top-[22%] h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{ background: "#0a1a3a" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[12%] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "#d39115" }}
      />

      {/* Grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      <div className="relative flex flex-col items-center gap-7 text-center">
        <div
          className="relative flex h-28 w-28 items-center justify-center rounded-[28px] border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(225,29,42,0.55)] transition-all duration-700"
          style={{
            transform: phase >= 1 ? "scale(1) rotate(0deg)" : "scale(0.7) rotate(-12deg)",
            opacity: phase >= 1 ? 1 : 0,
          }}
        >
          <img src={payraldMark} alt="" className="h-20 w-20" />
        </div>

        <img
          src={payraldLogo}
          alt="PayRald"
          className="h-12 w-auto max-w-[78vw] object-contain invert transition-all duration-700"
          style={{
            transform: phase >= 2 ? "translateY(0)" : "translateY(8px)",
            opacity: phase >= 2 ? 1 : 0,
          }}
        />

        <div
          className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-white/50 transition-opacity duration-700"
          style={{ opacity: phase >= 2 ? 1 : 0 }}
        >
          <span className="h-px w-6 bg-white/20" />
          Powered by ALIA
          <span className="h-px w-6 bg-white/20" />
        </div>
      </div>

      {/* Loader bar */}
      <div className="absolute bottom-14 left-1/2 h-[3px] w-40 -translate-x-1/2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-primary transition-all duration-[2000ms] ease-out"
          style={{ width: phase === 0 ? "0%" : phase === 1 ? "55%" : "100%" }}
        />
      </div>

      <p className="absolute bottom-6 left-0 right-0 text-center text-[10px] uppercase tracking-[0.3em] text-white/30">
        Move money at the speed of Africa
      </p>
    </main>
  );
}
