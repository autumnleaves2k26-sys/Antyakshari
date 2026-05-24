import { Link } from "wouter";
import logo from "../../../attached_assets/autumn_leaves_events_1779631833747.jpeg";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-4">
            <img 
              src={logo} 
              alt="Autumn Leaves Events" 
              className="h-16 w-16 rounded-full object-cover border border-border"
            />
            <div>
              <h3 className="font-serif font-bold text-lg text-foreground">Autumn Leaves Events</h3>
              <p className="text-sm text-muted-foreground italic">We Plan Your Party</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="link-footer-home">Home</Link>
            <Link href="/register" className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="link-footer-register">Register</Link>
            <Link href="/scan" className="text-muted-foreground hover:text-primary transition-colors text-sm" data-testid="link-footer-scan">Pass Scanner</Link>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-4">
            <p className="text-sm text-muted-foreground max-w-xs text-center md:text-right">
              Join us for a cinematic musical experience. More than a jamming.
            </p>
            <p className="text-xs text-muted-foreground/60">
              © {new Date().getFullYear()} Autumn Leaves Events. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
