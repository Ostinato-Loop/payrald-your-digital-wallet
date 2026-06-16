import { useState } from "react";

const DOMAINS: Record<string, string> = {
  Netflix: "netflix.com",
  Spotify: "spotify.com",
  Apple: "apple.com",
  "Apple TV+": "tv.apple.com",
  "Apple Music": "music.apple.com",
  Google: "google.com",
  "Google Play": "play.google.com",
  YouTube: "youtube.com",
  "YouTube Premium": "youtube.com",
  Amazon: "amazon.com",
  "Amazon Prime": "primevideo.com",
  "Prime Video": "primevideo.com",
  Microsoft: "microsoft.com",
  "Microsoft 365": "microsoft.com",
  Xbox: "xbox.com",
  "Xbox Game Pass": "xbox.com",
  PlayStation: "playstation.com",
  "PlayStation Network": "playstation.com",
  Steam: "steampowered.com",
  Nintendo: "nintendo.com",
  EA: "ea.com",
  "EA Play": "ea.com",
  Twitch: "twitch.tv",
  Discord: "discord.com",
  OpenAI: "openai.com",
  ChatGPT: "openai.com",
  GitHub: "github.com",
  Adobe: "adobe.com",
  "Adobe Creative Cloud": "adobe.com",
  Canva: "canva.com",
  Figma: "figma.com",
  Notion: "notion.so",
  Slack: "slack.com",
  Zoom: "zoom.us",
  Dropbox: "dropbox.com",
  Grammarly: "grammarly.com",
  LinkedIn: "linkedin.com",
  "LinkedIn Premium": "linkedin.com",
  Duolingo: "duolingo.com",
  Coursera: "coursera.org",
  Udemy: "udemy.com",
  Skillshare: "skillshare.com",
  "Disney+": "disneyplus.com",
  Disney: "disneyplus.com",
  Hulu: "hulu.com",
  Max: "max.com",
  HBO: "hbo.com",
  Paramount: "paramountplus.com",
  "Paramount+": "paramountplus.com",
  Peacock: "peacocktv.com",
  Crunchyroll: "crunchyroll.com",
  Audible: "audible.com",
  Kindle: "amazon.com",
  ExpressVPN: "expressvpn.com",
  NordVPN: "nordvpn.com",
  Surfshark: "surfshark.com",
  "1Password": "1password.com",
  LastPass: "lastpass.com",
  Dashlane: "dashlane.com",
  Malwarebytes: "malwarebytes.com",
  Norton: "norton.com",
  Avast: "avast.com",
  Kaspersky: "kaspersky.com",
  AWS: "aws.amazon.com",
  DigitalOcean: "digitalocean.com",
  Vercel: "vercel.com",
  Netlify: "netlify.com",
  Cloudflare: "cloudflare.com",
  Heroku: "heroku.com",
  MongoDB: "mongodb.com",
  MTN: "mtn.com",
  Airtel: "airtel.com",
  Glo: "gloworld.com",
  "9mobile": "9mobile.com.ng",
  DSTV: "dstv.com",
  Showmax: "showmax.com",
  "Canal+": "canalplus.com",
  Jumia: "jumia.com.ng",
  Konga: "konga.com",
  PiggyVest: "piggyvest.com",
  Flutterwave: "flutterwave.com",
  Paystack: "paystack.com",
};

function clearbitUrl(domain: string, size: number) {
  return `https://logo.clearbit.com/${domain}?size=${size * 2}`;
}

function faviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

function guessDomain(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com";
}

type Props = {
  name: string;
  size?: number;
  className?: string;
  rounded?: string;
};

type Stage = "clearbit" | "favicon" | "letter";

export function VendorLogo({
  name,
  size = 48,
  className = "",
  rounded = "rounded-2xl",
}: Props) {
  const domain = DOMAINS[name] ?? guessDomain(name);
  const [src, setSrc] = useState(() => clearbitUrl(domain, size));
  const [stage, setStage] = useState<Stage>("clearbit");
  const [loaded, setLoaded] = useState(false);

  const handleError = () => {
    if (stage === "clearbit") {
      setSrc(faviconUrl(domain));
      setStage("favicon");
    } else {
      setStage("letter");
    }
  };

  const handleLoad = () => setLoaded(true);

  if (stage === "letter") {
    return (
      <span
        className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-primary/30 to-primary/10 font-bold text-primary ${rounded} ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.38 }}
      >
        {name[0]?.toUpperCase()}
      </span>
    );
  }

  return (
    <div
      className={`relative shrink-0 overflow-hidden ${rounded} ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Shimmer while loading */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-surface-2" />
      )}
      <img
        src={src}
        alt={name}
        onError={handleError}
        onLoad={handleLoad}
        className={`h-full w-full object-contain bg-white transition-opacity duration-200 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
