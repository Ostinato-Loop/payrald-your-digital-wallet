import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, QrCode, Share2 } from "lucide-react";
import { Screen } from "@/components/payrald/Screen";
import { me } from "@/lib/payrald/mock";

export const Route = createFileRoute("/_app/qr")({
  head: () => ({ meta: [{ title: "Scan · PayRald" }] }),
  component: QrPage,
});

function QrPage() {
  return (
    <Screen title="Scan to pay" subtitle="Point your camera at any ALIA QR" back={false}>
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-black">
        {/* Faux camera viewport */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(45deg, oklch(0.12 0 0) 0 12px, oklch(0.09 0 0) 12px 24px)",
          }}
        />
        <div className="absolute inset-8 rounded-2xl border-2 border-primary/70" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-xs text-white/60">
          <Camera className="mx-auto mb-2 h-6 w-6" />
          Camera preview
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center pb-6">
          <button className="tap rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-glow-red">
            Hold to scan
          </button>
        </div>
      </div>

      <Link
        to="/receive"
        className="tap surface-card flex items-center gap-3 px-4 py-4"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <QrCode className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <div className="text-sm font-medium">My QR code</div>
          <div className="text-xs text-muted-foreground">Get paid as {me.handle}</div>
        </div>
        <Share2 className="h-4 w-4 text-muted-foreground" />
      </Link>

      <p className="px-2 text-center text-xs text-muted-foreground">
        Works for personal, merchant, business, school and government QRs. Powered by ALIA.
      </p>
    </Screen>
  );
}
