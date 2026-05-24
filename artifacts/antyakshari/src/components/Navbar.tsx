import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X } from "lucide-react";
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

        <div className="hidden md:flex items-center gap-7">
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
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            data-testid="nav-register-cta"
          >
            Register Now
          </Link>
        </div>

        <button
          className="md:hidden text-muted-foreground hover:text-foreground p-1"
          onClick={() => setOpen(!open)}
          data-testid="nav-mobile-toggle"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-white px-4 py-4 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`text-sm font-medium py-2.5 px-3 rounded-lg transition-colors ${
                location === link.href
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid={`nav-mobile-link-${link.label.toLowerCase()}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold text-center mt-2"
            data-testid="nav-mobile-register-cta"
          >
            Register Now
          </Link>
        </div>
      )}
    </nav>
  );
}
