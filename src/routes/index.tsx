import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
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
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/home" }), 1700);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-black px-6 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, #e11d2a 0%, transparent 70%)" }}
      />
      <div className="relative flex flex-col items-center gap-8 text-center">
        <img
          src={payraldMark}
          alt=""
          className="h-24 w-24 animate-[pulse_2s_ease-in-out_infinite] drop-shadow-[0_0_40px_rgba(225,29,42,0.35)]"
        />
        <img
          src={payraldLogo}
          alt="PayRald — Move money at the speed of Africa"
          className="h-14 w-auto max-w-[80vw] object-contain invert"
        />
        <div className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/40">
          <span className="h-px w-6 bg-white/20" />
          Powered by ALIA
          <span className="h-px w-6 bg-white/20" />
        </div>
      </div>
    </main>
  );
}
