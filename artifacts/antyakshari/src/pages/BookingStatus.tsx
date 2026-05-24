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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {registration.participants?.map((p, i) => (
          <Card key={p.id} className="bg-card border-border overflow-hidden flex flex-col group">
            {p.passId && registration.paymentStatus === 'approved' ? (
              <div className="relative aspect-[4/2] w-full overflow-hidden border-b border-border/50">
                <img src={passTemplate} alt="Event Pass" className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div>
                    <p className="font-serif font-bold text-xl text-primary drop-shadow-md">{p.participantName}</p>
                    <p className="font-mono text-xs text-muted-foreground drop-shadow-md">PASS: {p.passId}</p>
                  </div>
                  <div className="p-1.5 bg-white rounded">
                    {/* Dummy QR representation for UI */}
                    <div className="w-12 h-12 bg-black flex items-center justify-center">
                      <QrCodeIcon className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 pb-2">
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <User className="w-4 h-4" />
                  <span className="font-medium text-foreground">{p.participantName}</span>
                </div>
              </div>
            )}
            
            <CardContent className="p-4 bg-card/80 pt-4 flex-1">
              <div className="text-sm text-muted-foreground flex gap-4">
                {p.age && <span>Age: {p.age}</span>}
                {p.collegeOrCompany && <span className="truncate">{p.collegeOrCompany}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
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
