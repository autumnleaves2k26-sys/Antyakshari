import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import passTemplate from "@assets/Antyakshari_pass_template_1779631765412.png";
import {
  useGetAdminStats,
  useListRegistrations,
  useApproveRegistration,
  useRejectRegistration,
  getListRegistrationsQueryKey,
  getGetAdminStatsQueryKey,
  setAuthTokenGetter,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Check, X, ExternalLink, Loader2, Users, Ticket, Clock, CheckCircle, XCircle, AlertCircle, Download, Search } from "lucide-react";

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredRegistrations = registrations?.filter((reg) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    if (reg.bookingId.toLowerCase().includes(query)) return true;
    if (reg.name.toLowerCase().includes(query)) return true;
    if (reg.email?.toLowerCase().includes(query)) return true;
    if (reg.phone?.toLowerCase().includes(query)) return true;
    if (reg.participants && reg.participants.length > 0) {
      return reg.participants.some(
        (p) =>
          p.participantName.toLowerCase().includes(query) ||
          p.passId?.toLowerCase().includes(query)
      );
    }
    return false;
  }) ?? [];

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

  const handleDownloadSinglePass = (participantName: string, passId: string, qrToken: string) => {
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
      qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrToken)}`;
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
        ctx.fillText(participantName.toUpperCase(), W / 2, cardY + 62);

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
        ctx.fillText(passId, W / 2, cardY + 212);

        // Clear shadow for any other canvas operations
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Trigger download
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `Pass-${participantName.replace(/\s+/g, "_")}-${passId}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
    };
  };

  const statusTabs: { label: string; value: "all" | "pending" | "approved" | "rejected" }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans">
      {/* Header bar */}
      <div className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <Ticket className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Autumn Leaves Events</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Admin operations portal</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout} 
            className="border-slate-200 hover:bg-slate-50 text-slate-700 gap-2 h-9 rounded-lg"
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { icon: <Users size={18} />, label: "Total Bookings", value: stats?.totalRegistrations ?? "—", color: "text-slate-600", bg: "bg-white border-slate-200" },
            { icon: <Clock size={18} />, label: "Pending Review", value: stats?.pendingRegistrations ?? "—", color: "text-amber-600", bg: "bg-white border-slate-200" },
            { icon: <CheckCircle size={18} />, label: "Approved Bookings", value: stats?.approvedRegistrations ?? "—", color: "text-emerald-600", bg: "bg-white border-slate-200" },
            { icon: <XCircle size={18} />, label: "Rejected Bookings", value: stats?.rejectedRegistrations ?? "—", color: "text-rose-600", bg: "bg-white border-slate-200" },
            { icon: <Ticket size={18} />, label: "Passes Issued", value: stats ? `${stats.totalPassesIssued}/${stats.totalPasses}` : "—", color: "text-indigo-600", bg: "bg-white border-slate-200" },
          ].map((s) => (
            <Card key={s.label} className={`${s.bg} border shadow-xs rounded-xl`}>
              <CardContent className="p-5">
                <div className={`${s.color} mb-2.5`}>{s.icon}</div>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">{s.value}</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Registrations Card Container */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
          {/* Toolbar: Filter Tabs & Search Bar */}
          <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
            {/* Tabs */}
            <div className="flex items-center gap-1">
              {statusTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all ${
                    statusFilter === tab.value
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-150"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search bookings or pass holders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-250 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                <span className="text-sm font-medium">Loading registrations…</span>
              </div>
            ) : listError ? (
              <div className="flex items-center justify-center py-20 gap-3 text-rose-600">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Failed to load registrations. Check connection and reload.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                      <TableHead className="text-[10px] uppercase tracking-wider font-bold text-slate-500 py-3.5">Booking ID</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider font-bold text-slate-500 py-3.5">Contact Info</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider font-bold text-slate-500 py-3.5">Passes</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider font-bold text-slate-500 py-3.5">Status</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider font-bold text-slate-500 py-3.5">Payment Proof</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider font-bold text-slate-500 py-3.5 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.length === 0 ? (
                      <TableRow className="border-transparent">
                        <TableCell colSpan={6} className="text-center py-20 text-slate-400 text-sm">
                          {searchQuery ? "No matching registrations found." : "No registrations found."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRegistrations.map((reg) => (
                        <TableRow key={reg.id} className="border-slate-100 hover:bg-slate-50/40 transition-colors">
                          <TableCell className="font-mono text-xs font-semibold py-4">
                            <a
                              href={`/booking/${reg.bookingId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1.5 bg-indigo-50/60 border border-indigo-100/80 px-2.5 py-1 rounded-md"
                            >
                              {reg.bookingId} <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </TableCell>
                          <TableCell className="py-4">
                            <p className="font-semibold text-slate-900 text-sm">{reg.name}</p>
                            <div className="flex flex-col gap-0.5 mt-1">
                              <span className="text-[11px] text-slate-500 font-mono">{reg.email}</span>
                              <span className="text-[11px] text-slate-500 font-mono">{reg.phone}</span>
                            </div>
                            {reg.participants && reg.participants.length > 0 && (
                              <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2 max-w-sm">
                                <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Pass Holders</p>
                                <div className="space-y-1.5">
                                  {reg.participants.map((p) => (
                                    <div key={p.id} className="flex items-start justify-between text-xs text-slate-700 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-lg gap-4">
                                      <div className="min-w-0 flex-1">
                                        <span className="font-semibold text-slate-900 block truncate">{p.participantName}</span>
                                        {(p.email || p.phone) && (
                                          <div className="flex flex-col gap-0.5 mt-0.5 text-[10px] text-slate-500 font-mono">
                                            {p.email && <span className="truncate">{p.email}</span>}
                                            {p.phone && <span>{p.phone}</span>}
                                          </div>
                                        )}
                                      </div>
                                      {p.passId ? (
                                        <div className="flex items-center gap-2 flex-shrink-0 self-center">
                                          <span className="font-mono text-[10px] bg-slate-200 text-slate-800 border border-slate-300 px-1.5 py-0.5 rounded font-bold">{p.passId}</span>
                                          <button
                                            onClick={() => handleDownloadSinglePass(p.participantName, p.passId!, p.qrToken!)}
                                            className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all p-1.5 rounded border border-slate-200 bg-white"
                                            title="Download Pass Image"
                                          >
                                            <Download className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      ) : (
                                        <span className="text-[10px] text-slate-400 italic self-center">No pass generated</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold shadow-xs">
                              {reg.totalPasses}
                            </span>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge
                              className={`shadow-xs px-2.5 py-1 text-xs border font-semibold ${
                                reg.paymentStatus === "approved"
                                  ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                                  : reg.paymentStatus === "rejected"
                                  ? "text-rose-700 bg-rose-50 border-rose-200"
                                  : "text-amber-700 bg-amber-50 border-amber-200"
                              }`}
                            >
                              {reg.paymentStatus.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            {reg.paymentScreenshot ? (
                              <a
                                href={reg.paymentScreenshot}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 transition-colors font-medium border border-indigo-100 bg-indigo-50/40 px-2.5 py-1 rounded-lg hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" /> View Proof
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Not uploaded</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right py-4">
                            {reg.paymentStatus === "pending" && (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1 rounded-lg shadow-sm font-semibold"
                                  onClick={() => handleApprove(reg.id)}
                                  disabled={approveMutation.isPending}
                                >
                                  <Check className="h-3.5 w-3.5" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 border-slate-200 text-slate-700 hover:bg-slate-50 gap-1 rounded-lg bg-white font-semibold"
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
