import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X, QrCode, Music } from "lucide-react";
import autumnLogo from "@assets/autumn_leaves_events_1779631833747.jpeg";

export default function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/register", label: "Register" },
    { href: "/scan", label: "Scan" },
    { href: "/admin", label: "Admin" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-primary/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src={autumnLogo}
            alt="Autumn Leaves Events"
            className="h-9 w-auto rounded object-contain"
            data-testid="navbar-logo"
          />
          <div className="hidden sm:block">
            <p className="text-xs text-muted-foreground leading-none font-medium tracking-widest uppercase">Presents</p>
            <p className="text-sm font-semibold text-primary leading-none mt-0.5">Antyakshari</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                location === link.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`nav-link-${link.label.toLowerCase()}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/register"
            className="px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            data-testid="nav-register-cta"
          >
            Register Now
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(!open)}
          data-testid="nav-mobile-toggle"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-card px-4 py-4 flex flex-col gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`text-sm font-medium py-1 ${
                location === link.href ? "text-primary" : "text-muted-foreground"
              }`}
              data-testid={`nav-mobile-link-${link.label.toLowerCase()}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold text-center mt-2"
            data-testid="nav-mobile-register-cta"
          >
            Register Now
          </Link>
        </div>
      )}
    </nav>
  );
}
