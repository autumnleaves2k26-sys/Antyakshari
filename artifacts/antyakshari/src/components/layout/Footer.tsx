import { Link } from "wouter";
import logo from "../../../attached_assets/autumn_leaves_events_1779631833747.jpeg";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 py-12 px-6 bg-white text-slate-600 shadow-inner mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          
          {/* Logo & Brand */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-65 transition duration-500"></div>
              <img 
                src={logo} 
                alt="Autumn Leaves Events" 
                className="relative h-14 w-14 rounded-full object-cover border border-slate-100 shadow-sm"
              />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-900 tracking-wide">Autumn Leaves Events</h3>
              <p className="text-xs text-slate-400 italic">We Plan Your Party</p>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="flex flex-col items-center gap-2.5">
            <Link href="/" className="text-slate-500 hover:text-primary transition-colors text-sm font-medium" data-testid="link-footer-home">Home</Link>
            <Link href="/register" className="text-slate-500 hover:text-primary transition-colors text-sm font-medium" data-testid="link-footer-register">Register</Link>
            <Link href="/scan" className="text-slate-500 hover:text-primary transition-colors text-sm font-medium" data-testid="link-footer-scan">Pass Scanner</Link>
          </div>
          
          {/* Tagline & Copyright */}
          <div className="flex flex-col items-center md:items-end gap-4">
            <p className="text-sm text-slate-500 max-w-xs text-center md:text-right leading-relaxed">
              Join us for a cinematic musical experience. More than a jamming.
            </p>
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} Autumn Leaves Events. All rights reserved.
            </p>
          </div>
          
        </div>
      </div>
    </footer>
  );
}
