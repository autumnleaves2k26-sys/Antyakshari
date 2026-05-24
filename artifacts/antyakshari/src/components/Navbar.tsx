import { Link } from "wouter";
import autumnLogo from "@assets/autumn_leaves_events_1779631833747.jpeg";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src={autumnLogo}
            alt="Autumn Leaves Events"
            className="h-8 w-auto rounded object-contain"
            data-testid="navbar-logo"
          />
          <div className="hidden sm:block">
            <p className="text-[10px] text-muted-foreground leading-none font-medium tracking-widest uppercase">Presents</p>
            <p className="text-sm font-bold text-foreground leading-none mt-0.5 font-serif">Antyakshari</p>
          </div>
        </Link>

        <Link
          href="/register"
          className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
          data-testid="nav-register-cta"
        >
          Register Now
        </Link>
      </div>
    </nav>
  );
}
