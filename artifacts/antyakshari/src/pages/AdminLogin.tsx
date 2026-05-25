import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useAdminLogin();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    loginMutation.mutate({ data: { password } }, {
      onSuccess: (res) => {
        if (res.success && res.token) {
          localStorage.setItem("adminToken", res.token);
          setLocation("/admin/dashboard");
        } else {
          toast({ title: "Login Failed", description: "Invalid credentials", variant: "destructive" });
        }
      },
      onError: () => {
        toast({ title: "Error", description: "Invalid credentials or server error.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-[80dvh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur border-border/50 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <CardTitle className="font-serif text-2xl font-bold">Admin Portal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background text-center text-lg tracking-widest"
                data-testid="input-admin-password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loginMutation.isPending}
              data-testid="button-admin-login"
            >
              {loginMutation.isPending ? "Authenticating..." : "Access Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
