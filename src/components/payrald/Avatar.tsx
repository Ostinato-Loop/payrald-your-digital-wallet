import { cn } from "@/lib/utils";

export function Avatar({
  name,
  color = "#e11d2a",
  size = 40,
  className,
}: {
  name: string;
  color?: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .replace(/^@/, "")
    .split(/[\s.]+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className={cn("flex items-center justify-center rounded-full font-semibold text-white", className)}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}, color-mix(in oklab, ${color} 55%, black))`,
        fontSize: size * 0.38,
      }}
      aria-hidden
    >
      {initials || "·"}
    </div>
  );
}
