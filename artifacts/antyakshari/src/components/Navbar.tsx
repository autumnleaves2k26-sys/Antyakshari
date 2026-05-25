import { Link, useLocation } from "wouter";
import autumnLogo from "@assets/autumn_leaves_events_1779631833747.jpeg";

export default function Navbar() {
  const [location] = useLocation();
  const isHome = location === "/";

  return (
    <nav className="fixed top-3 left-0 right-0 z-[80] px-4 sm:px-6">
      <div
        className={`max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 rounded-2xl border shadow-lg backdrop-blur-xl transition-colors ${
          isHome
            ? "bg-black/30 border-white/20"
            : "bg-white/85 border-black/10"
        }`}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src={autumnLogo}
            alt="Autumn Leaves Events"
            className="h-8 w-auto rounded object-contain"
            data-testid="navbar-logo"
          />
          <div className="hidden sm:block">
            <p
              className={`text-[10px] leading-none font-medium tracking-widest uppercase ${
                isHome ? "text-white/70" : "text-muted-foreground"
              }`}
            >
              Event Organizer
            </p>
            <p
              className={`text-sm font-bold leading-none mt-0.5 font-serif ${
                isHome ? "text-white" : "text-foreground"
              }`}
            >
              Autumn Leaves Events
            </p>
          </div>
        </Link>

        <Link
          href="/register"
          className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          data-testid="nav-register-cta"
        >
          Register Now
        </Link>
      </div>
    </nav>
  );
}
