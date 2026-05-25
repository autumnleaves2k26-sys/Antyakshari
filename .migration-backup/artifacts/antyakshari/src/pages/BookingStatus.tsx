import { useParams, Link } from "wouter";
import { useGetRegistration, getGetRegistrationQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Ticket, Calendar, MapPin, User } from "lucide-react";
import passTemplate from "@assets/Antyakshari_pass_template_1779631765412.png";

export default function BookingStatus() {
  const params = useParams();
  const bookingId = params.bookingId;

  const { data: registration, isLoading, error } = useGetRegistration(bookingId || "", {
    query: {
      enabled: !!bookingId,
      queryKey: getGetRegistrationQueryKey(bookingId || "")
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-[80dvh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-[80dvh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/50 border-destructive/50 text-center p-8">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Booking Not Found</h2>
          <p className="text-muted-foreground mb-6">We couldn't find a registration with this booking ID.</p>
          <Link href="/">
            <a className="text-primary hover:underline">Return Home</a>
          </Link>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return "bg-green-500/10 text-green-500 border-green-500/20";
      case 'rejected': return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold mb-2 text-foreground">Booking Status</h1>
          <p className="text-muted-foreground font-mono">ID: {registration.bookingId}</p>
        </div>
        <Badge variant="outline" className={`px-4 py-1.5 text-sm uppercase tracking-wider ${getStatusColor(registration.paymentStatus)}`}>
          {registration.paymentStatus}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Booked By</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-lg">{registration.name}</p>
            <p className="text-sm text-muted-foreground">{registration.email}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Total Passes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-2xl text-primary">{registration.totalPasses}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{new Date(registration.createdAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="font-serif text-2xl font-bold mb-6">Participants & Passes</h2>
      
      {registration.paymentStatus !== 'approved' && (
        <Card className="bg-background border-border/50 p-6 mb-8 text-center">
          <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
            Passes will be generated and displayed here once your registration is approved.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center">
        {registration.participants?.map((p, i) => {
          const hasPass = p.passId && registration.paymentStatus === 'approved';

          const handleDownload = () => {
            if (!hasPass || !p.passId || !p.qrToken) return;

            const bgImg = new Image();
            bgImg.crossOrigin = "anonymous";
            bgImg.src = passTemplate;
            bgImg.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = bgImg.naturalWidth || 600;
              canvas.height = bgImg.naturalHeight || 1000;
              const ctx = canvas.getContext("2d");
              if (!ctx) return;

              const W = canvas.width;
              const H = canvas.height;

              // 1. Draw Pass Template Background
              ctx.drawImage(bgImg, 0, 0, W, H);

              // 2. Draw QR code
              const qrImage = new Image();
              qrImage.crossOrigin = "anonymous";
              qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(p.qrToken!)}`;
              qrImage.onload = () => {
                // White card bg for QR
                const qrCardSize = W * 0.44;
                const qrX = (W - qrCardSize) / 2;
                const qrY = H * 0.465;

                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.roundRect(qrX, qrY, qrCardSize, qrCardSize, 24);
                ctx.fill();

                // QR Code image
                const padding = qrCardSize * 0.08;
                ctx.drawImage(qrImage, qrX + padding, qrY + padding, qrCardSize - 2 * padding, qrCardSize - 2 * padding);

                // Y-coordinate reference for text drawing
                const cardY = H * 0.715;

                // 4. Pass Holder Details Text with Shadow for Readability (No Grey Background Box)
                ctx.textAlign = "center";
                ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
                ctx.shadowBlur = 6;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 2;
                
                // Pass Holder Label
                ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
                ctx.font = "bold 13px sans-serif";
                ctx.fillText("PASS HOLDER", W / 2, cardY + 32);

                // Pass Holder Name
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 23px sans-serif";
                ctx.fillText(p.participantName.toUpperCase(), W / 2, cardY + 62);

                // Venue Label
                ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
                ctx.font = "bold 13px sans-serif";
                ctx.fillText("VENUE", W / 2, cardY + 98);

                // Venue Name
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 16px sans-serif";
                ctx.fillText("PRAKRUTHI RESTAURANT", W / 2, cardY + 124);
                ctx.font = "14px sans-serif";
                ctx.fillText("Karimnagar", W / 2, cardY + 144);

                // Pass ID Label
                ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
                ctx.font = "bold 13px sans-serif";
                ctx.fillText("PASS ID", W / 2, cardY + 180);

                // Pass ID Value
                ctx.fillStyle = "#e8813a";
                ctx.font = "bold 21px monospace";
                ctx.fillText(p.passId!, W / 2, cardY + 212);

                // Clear shadow for any other canvas operations
                ctx.shadowColor = "transparent";
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;

                // Trigger download
                const url = canvas.toDataURL("image/png");
                const a = document.createElement("a");
                a.href = url;
                a.download = `Pass-${p.participantName.replace(/\s+/g, "_")}-${p.passId}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              };
            };
          };

          return (
            <div key={p.id} className="w-full max-w-sm flex flex-col items-center">
              {hasPass ? (
                <>
                  {/* Vertical Pass Using Provided Pass Template */}
                  <div className="w-full aspect-[1/1.65] rounded-3xl overflow-hidden relative shadow-2xl border border-white/10 group">
                    {/* Template Background Image */}
                    <img 
                      src={passTemplate} 
                      alt="Pass Template" 
                      className="absolute inset-0 w-full h-full object-cover" 
                    />
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-between p-6 bg-black/10">
                      {/* Top spacing to preserve title pre-rendered on the template */}
                      <div className="h-[40.5%]" />
                      
                      {/* QR Code Container */}
                      <div className="p-3 bg-white rounded-2xl shadow-xl border border-white/20">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(p.qrToken!)}`} 
                          alt="QR Code" 
                          className="w-32 h-32 object-contain"
                        />
                      </div>
                      
                      {/* Details overlay at the bottom */}
                      <div className="w-full text-center space-y-2 mt-auto mb-2 p-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                        <div>
                          <p className="text-[8px] uppercase tracking-widest text-white/50">Pass Holder</p>
                          <p className="text-sm font-serif font-bold text-white tracking-wide uppercase truncate">{p.participantName}</p>
                        </div>
                        
                        <div>
                          <p className="text-[8px] uppercase tracking-widest text-white/50">Venue</p>
                          <p className="text-[10px] font-semibold text-white/90">PRAKRUTHI RESTAURANT, Karimnagar</p>
                        </div>
                        
                        <div className="pt-1.5">
                          <p className="text-[8px] uppercase tracking-widest text-white/50">Pass ID</p>
                          <p className="font-mono text-xs text-primary font-bold tracking-wider">{p.passId}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleDownload}
                    className="mt-4 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm inline-flex items-center gap-2"
                  >
                    Download Pass Image
                  </button>
                </>
              ) : (
                <Card className="w-full bg-card border-border p-6 flex flex-col justify-between h-[250px]">
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <User className="w-4 h-4" />
                    <span className="font-medium text-foreground">{p.participantName}</span>
                  </div>
                  <CardContent className="p-0 bg-transparent flex-1 flex flex-col justify-end text-sm text-muted-foreground">
                    <div className="flex gap-4">
                      {p.age && <span>Age: {p.age}</span>}
                      {p.collegeOrCompany && <span className="truncate">{p.collegeOrCompany}</span>}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Simple internal icon for the pass preview
function QrCodeIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round" {...props}>
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
    </svg>
  );
}
