import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Globe2, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_auth/welcome")({
  head: () => ({ meta: [{ title: "Welcome to PayRald" }] }),
  component: Welcome,
});

const slides = [
  {
    title: "Send money with a @username",
    body: "Forget account numbers. Pay anyone in Africa using their PayRald handle, email or phone.",
    icon: ArrowRight,
    color: "#e11d2a",
  },
  {
    title: "Pay merchants you love",
    body: "Spotify, Netflix, OpenAI, Steam — settled instantly by ALIA. No card details required.",
    icon: Sparkles,
    color: "#d39115",
  },
  {
    title: "Trust built-in",
    body: "Verified identities, trust scores and ALIA-monitored sessions on every transfer.",
    icon: ShieldCheck,
    color: "#1f6f3f",
  },
];

function Welcome() {
  const [i, setI] = useState(0);
  const slide = slides[i];
  const Icon = slide.icon;
  const last = i === slides.length - 1;

  return (
    <div className="flex flex-1 flex-col px-6 pb-8 pt-4">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div
          className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 backdrop-blur-xl"
          style={{ background: `linear-gradient(135deg, ${slide.color}55, transparent)` }}
        >
          <Icon className="h-10 w-10" style={{ color: slide.color }} />
        </div>
        <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight">
          {slide.title}
        </h1>
        <p className="mt-4 max-w-sm text-balance text-sm leading-relaxed text-muted-foreground">
          {slide.body}
        </p>

        <div className="mt-8 flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-8 bg-primary" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {!last ? (
          <button
            onClick={() => setI((v) => Math.min(v + 1, slides.length - 1))}
            className="tap w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-glow-red"
          >
            Continue
          </button>
        ) : (
          <Link
            to="/signup"
            className="tap w-full rounded-full bg-primary py-4 text-center text-sm font-semibold text-primary-foreground shadow-glow-red"
          >
            Create your account
          </Link>
        )}
        <Link
          to="/signin"
          className="tap w-full rounded-full border border-border bg-surface py-4 text-center text-sm font-semibold text-foreground"
        >
          I already have an account
        </Link>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
          <Globe2 className="h-3 w-3" /> Available across Africa · Powered by ALIA
        </p>
      </div>
    </div>
  );
}
