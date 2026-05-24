import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  useGetAdminStats,
  useListRegistrations,
  useApproveRegistration,
  useRejectRegistration,
  getListRegistrationsQueryKey,
  getGetAdminStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Check, X, ExternalLink, Loader2, Users, Ticket, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setLocation("/admin");
      return;
    }
    setAuthTokenGetter(() => localStorage.getItem("adminToken"));
  }, [setLocation]);

  const { data: stats, isError: statsError } = useGetAdminStats({
    query: {
      refetchInterval: 30000,
      queryKey: getGetAdminStatsQueryKey(),
    }
  });

  const { data: registrations, isLoading, isError: listError } = useListRegistrations(
    statusFilter === "all" ? {} : { status: statusFilter },
    {
      query: {
        queryKey: [...getListRegistrationsQueryKey(), statusFilter],
      }
    }
  );

  const approveMutation = useApproveRegistration();
  const rejectMutation = useRejectRegistration();

  const handleLogout = () => {
    setAuthTokenGetter(null);
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

  const statusTabs: { label: string; value: "all" | "pending" | "approved" | "rejected" }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Antyakshari — Event Operations</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { icon: <Users size={18} />, label: "Total", value: stats?.totalRegistrations ?? "—", color: "text-foreground" },
            { icon: <Clock size={18} />, label: "Pending", value: stats?.pendingRegistrations ?? "—", color: "text-amber-600" },
            { icon: <CheckCircle size={18} />, label: "Approved", value: stats?.approvedRegistrations ?? "—", color: "text-green-600" },
            { icon: <XCircle size={18} />, label: "Rejected", value: stats?.rejectedRegistrations ?? "—", color: "text-red-600" },
            { icon: <Ticket size={18} />, label: "Passes Issued", value: stats ? `${stats.totalPassesIssued}/${stats.totalPasses}` : "—", color: "text-primary" },
          ].map((s) => (
            <Card key={s.label} className="bg-white border-border shadow-xs">
              <CardContent className="p-5">
                <div className={`${s.color} mb-2`}>{s.icon}</div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Registrations table */}
        <Card className="bg-white border-border shadow-xs">
          {/* Filter tabs */}
          <div className="border-b border-border px-6 pt-5 pb-0 flex items-center gap-1">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
                  statusFilter === tab.value
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading registrations…</span>
              </div>
            ) : listError ? (
              <div className="flex items-center justify-center py-20 gap-3 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">Failed to load. Check your session and reload.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Booking ID</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Contact</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Passes</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Payment</TableHead>
                      <TableHead className="text-xs uppercase tracking-wider font-semibold text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!registrations || registrations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-16 text-muted-foreground text-sm">
                          No registrations found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      registrations.map((reg) => (
                        <TableRow key={reg.id} className="border-border hover:bg-muted/20 transition-colors">
                          <TableCell className="font-mono text-xs font-medium text-foreground">{reg.bookingId}</TableCell>
                          <TableCell>
                            <p className="font-medium text-sm text-foreground">{reg.name}</p>
                            <p className="text-xs text-muted-foreground">{reg.email}</p>
                            <p className="text-xs text-muted-foreground">{reg.phone}</p>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                              {reg.totalPasses}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                reg.paymentStatus === "approved"
                                  ? "text-green-700 bg-green-50 border-green-200"
                                  : reg.paymentStatus === "rejected"
                                  ? "text-red-700 bg-red-50 border-red-200"
                                  : "text-amber-700 bg-amber-50 border-amber-200"
                              }
                            >
                              {reg.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {reg.paymentScreenshot ? (
                              <a
                                href={reg.paymentScreenshot}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" /> View
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">Not uploaded</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {reg.paymentStatus === "pending" && (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-green-700 hover:text-green-700 hover:bg-green-50 border-green-200 gap-1.5"
                                  onClick={() => handleApprove(reg.id)}
                                  disabled={approveMutation.isPending}
                                >
                                  <Check className="h-3.5 w-3.5" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-red-700 hover:text-red-700 hover:bg-red-50 border-red-200 gap-1.5"
                                  onClick={() => handleReject(reg.id)}
                                  disabled={rejectMutation.isPending}
                                >
                                  <X className="h-3.5 w-3.5" /> Reject
                                </Button>
                              </div>
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
    </div>
  );
}
