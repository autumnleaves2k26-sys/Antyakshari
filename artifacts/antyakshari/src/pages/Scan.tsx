import { useState } from "react";
import { useValidatePass, useMarkPassUsed, getValidatePassQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScanLine, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export default function Scan() {
  const [tokenInput, setTokenInput] = useState("");
  const [tokenToValidate, setTokenToValidate] = useState("");
  const { toast } = useToast();

  const { data: validationResult, isFetching, refetch } = useValidatePass(tokenToValidate, {
    query: {
      enabled: !!tokenToValidate,
      retry: false,
      queryKey: getValidatePassQueryKey(tokenToValidate),
    }
  });

  const markUsedMutation = useMarkPassUsed();

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setTokenToValidate(tokenInput.trim());
  };

  const handleMarkUsed = () => {
    if (!tokenToValidate) return;
    markUsedMutation.mutate({ qrToken: tokenToValidate }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Pass marked as used successfully." });
        refetch();
      },
      onError: () => {
        toast({ title: "Error", description: "Could not mark pass as used.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[80dvh]">
      <Card className="w-full max-w-md bg-card border-border shadow-2xl">
        <CardHeader className="text-center pb-8 border-b border-border/50">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <ScanLine className="w-8 h-8" />
          </div>
          <CardTitle className="font-serif text-3xl font-bold">Pass Scanner</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Enter the QR token to validate a pass.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-8">
          <form onSubmit={handleValidate} className="flex gap-2">
            <Input 
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="e.g. qrt_abc123"
              className="bg-background text-lg font-mono placeholder:font-sans"
              data-testid="input-qr-token"
            />
            <Button type="submit" disabled={isFetching} data-testid="button-validate">
              Validate
            </Button>
          </form>

          {validationResult && (
            <div className="p-6 rounded-xl border flex flex-col items-center text-center transition-all bg-background border-border shadow-inner">
              {validationResult.status === 'valid' && (
                <>
                  <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                  <h3 className="text-2xl font-bold text-green-500 tracking-wide">VALID PASS</h3>
                </>
              )}
              {validationResult.status === 'used' && (
                <>
                  <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
                  <h3 className="text-2xl font-bold text-yellow-500 tracking-wide">ALREADY USED</h3>
                </>
              )}
              {validationResult.status === 'invalid' && (
                <>
                  <XCircle className="w-16 h-16 text-destructive mb-4" />
                  <h3 className="text-2xl font-bold text-destructive tracking-wide">INVALID PASS</h3>
                </>
              )}

              {validationResult.status !== 'invalid' && (
                <div className="mt-6 w-full pt-6 border-t border-border/50 text-left space-y-2">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">Pass Details</p>
                  <p className="font-medium text-lg">{validationResult.participantName}</p>
                  <p className="font-mono text-sm text-primary">ID: {validationResult.passId}</p>
                  <p className="text-sm text-muted-foreground">{validationResult.eventName}</p>
                </div>
              )}

              {validationResult.status === 'valid' && (
                <Button 
                  className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white" 
                  size="lg"
                  onClick={handleMarkUsed}
                  disabled={markUsedMutation.isPending}
                  data-testid="button-mark-used"
                >
                  {markUsedMutation.isPending ? "Processing..." : "Mark as Used"}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
