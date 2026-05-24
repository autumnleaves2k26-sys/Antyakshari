import { Link, useLocation } from "wouter";
import logo from "../../../attached_assets/autumn_leaves_events_1779631833747.jpeg";

export function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group" data-testid="link-home-logo">
          <img 
            src={logo} 
            alt="Autumn Leaves Events" 
            className="h-10 w-10 rounded-full object-cover border border-primary/20 group-hover:border-primary transition-colors"
          />
          <span className="font-serif font-bold text-xl tracking-wide text-foreground">Antyakshari</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className={`text-sm font-medium transition-colors ${location === '/' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} data-testid="link-home">Home</Link>
          <Link href="/register" className={`text-sm font-medium transition-colors ${location === '/register' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} data-testid="link-register">Register</Link>
          <Link href="/scan" className={`text-sm font-medium transition-colors ${location === '/scan' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} data-testid="link-scan">Scan</Link>
          <Link href="/admin" className={`text-sm font-medium transition-colors ${location.startsWith('/admin') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} data-testid="link-admin">Admin</Link>
        </div>
      </div>
    </nav>
  );
}
