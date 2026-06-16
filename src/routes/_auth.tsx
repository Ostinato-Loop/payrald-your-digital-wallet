import { createFileRoute, Outlet } from "@tanstack/react-router";
import payraldMark from "@/assets/payrald-mark.png";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[460px] flex-col overflow-hidden bg-background">
      {/* Background brand orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: "#0a1a3a" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-32 h-56 w-56 rounded-full opacity-30 blur-3xl"
        style={{ background: "#e11d2a" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: "#d39115" }}
      />

      {/* Decorative top brand bar */}
      <div className="relative z-10 flex items-center justify-center pt-6">
        <img src={payraldMark} alt="PayRald" className="h-9 w-9" />
      </div>

      <main className="relative z-10 flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
