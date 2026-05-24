import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { 
  useGetAdminStats, 
  useListRegistrations, 
  useApproveRegistration, 
  useRejectRegistration,
  getListRegistrationsQueryKey,
  getGetAdminStatsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Check, X, ExternalLink, Loader2, Users, Ticket, Clock, CheckCircle, XCircle } from "lucide-react";

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setLocation("/admin");
    }
  }, [location, setLocation]);

  const { data: stats } = useGetAdminStats({
    query: {
      refetchInterval: 30000,
      queryKey: getGetAdminStatsQueryKey(),
    }
  });

  const { data: registrations, isLoading } = useListRegistrations(
    statusFilter === 'all' ? {} : { status: statusFilter }
  );

  const approveMutation = useApproveRegistration();
  const rejectMutation = useRejectRegistration();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setLocation("/admin");
  };

  const handleApprove = (id: number) => {
    approveMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Approved", description: "Registration approved and passes generated." });
        queryClient.invalidateQueries({ queryKey: getListRegistrationsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
      },
      onError: () => toast({ title: "Error", description: "Could not approve.", variant: "destructive" })
    });
  };

  const handleReject = (id: number) => {
    rejectMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Rejected", description: "Registration has been rejected." });
        queryClient.invalidateQueries({ queryKey: getListRegistrationsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
      },
      onError: () => toast({ title: "Error", description: "Could not reject.", variant: "destructive" })
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Command Center</h1>
          <p className="text-muted-foreground">Antyakshari Event Operations</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="text-muted-foreground border-border">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <Card className="bg-card border-border/50 shadow-none">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Users className="w-5 h-5 text-muted-foreground mb-2" />
              <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
              <p className="text-xs text-muted-foreground uppercase">Total Reg</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50 shadow-none">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Clock className="w-5 h-5 text-yellow-500 mb-2" />
              <p className="text-2xl font-bold text-yellow-500">{stats.pendingRegistrations}</p>
              <p className="text-xs text-muted-foreground uppercase">Pending</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50 shadow-none">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <CheckCircle className="w-5 h-5 text-green-500 mb-2" />
              <p className="text-2xl font-bold text-green-500">{stats.approvedRegistrations}</p>
              <p className="text-xs text-muted-foreground uppercase">Approved</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50 shadow-none">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <XCircle className="w-5 h-5 text-destructive mb-2" />
              <p className="text-2xl font-bold text-destructive">{stats.rejectedRegistrations}</p>
              <p className="text-xs text-muted-foreground uppercase">Rejected</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50 shadow-none bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Ticket className="w-5 h-5 text-primary mb-2" />
              <p className="text-2xl font-bold text-primary">{stats.totalPassesIssued} <span className="text-muted-foreground text-sm">/ {stats.totalPasses}</span></p>
              <p className="text-xs text-muted-foreground uppercase">Passes Issued</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-card border-border">
        <CardHeader className="pb-0 border-b border-border/50 px-6 pt-6">
          <Tabs defaultValue="all" onValueChange={(v: any) => setStatusFilter(v)}>
            <TabsList className="bg-background border border-border w-full justify-start rounded-none rounded-t-lg">
              <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-card">All</TabsTrigger>
              <TabsTrigger value="pending" className="flex-1 data-[state=active]:bg-card">Pending</TabsTrigger>
              <TabsTrigger value="approved" className="flex-1 data-[state=active]:bg-card">Approved</TabsTrigger>
              <TabsTrigger value="rejected" className="flex-1 data-[state=active]:bg-card">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Passes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        No registrations found for this filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    registrations?.map((reg) => (
                      <TableRow key={reg.id} className="border-border/50 hover:bg-background/50">
                        <TableCell className="font-mono text-xs">{reg.bookingId}</TableCell>
                        <TableCell>
                          <p className="font-medium">{reg.name}</p>
                          <p className="text-xs text-muted-foreground">{reg.email}</p>
                          <p className="text-xs text-muted-foreground">{reg.phone}</p>
                        </TableCell>
                        <TableCell className="font-bold text-primary">{reg.totalPasses}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            reg.paymentStatus === 'approved' ? "text-green-500 border-green-500/30" : 
                            reg.paymentStatus === 'rejected' ? "text-destructive border-destructive/30" : 
                            "text-yellow-500 border-yellow-500/30"
                          }>
                            {reg.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {reg.paymentScreenshot ? (
                            <a href={reg.paymentScreenshot} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-primary hover:underline">
                              <ExternalLink className="w-3 h-3 mr-1" /> View Image
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not uploaded</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {reg.paymentStatus === 'pending' && (
                            <>
                              <Button size="icon" variant="outline" className="h-8 w-8 text-green-500 hover:text-green-500 hover:bg-green-500/10 border-green-500/20" onClick={() => handleApprove(reg.id)}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="outline" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20" onClick={() => handleReject(reg.id)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
