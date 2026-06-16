import { createFileRoute } from "@tanstack/react-router";
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
      { property: "og:title", content: "PayRald — Move money at the speed of Africa" },
      {
        property: "og:description",
        content:
          "Send, receive and pay across Africa using just a username, email or phone. Powered by ALIA.",
      },
    ],
  }),
  component: Splash,
});

function Splash() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-white">
      {/* subtle red glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #e11d2a 0%, transparent 70%)" }}
      />

      <div className="relative flex flex-col items-center gap-8 text-center">
        <img
          src={payraldMark}
          alt="PayRald mark"
          className="h-24 w-24 animate-[pulse_2s_ease-in-out_infinite] drop-shadow-[0_0_40px_rgba(225,29,42,0.35)]"
        />

        <img
          src={payraldLogo}
          alt="PayRald — Move money at the speed of Africa"
          className="h-16 w-auto max-w-[80vw] object-contain invert"
        />

        <p className="max-w-sm text-sm leading-relaxed text-white/60">
          Move money at the speed of Africa. Just a username, email or phone — no account numbers, ever.
        </p>

        <div className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/40">
          <span className="h-px w-6 bg-white/20" />
          Powered by ALIA
          <span className="h-px w-6 bg-white/20" />
        </div>

        {done && (
          <div className="mt-4 text-xs text-white/40 animate-in fade-in duration-500">
            Loading your wallet…
          </div>
        )}
      </div>
    </main>
  );
}
