import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useMarkPassUsed } from "@workspace/api-client-react";
import { CheckCircle2, XCircle, AlertTriangle, Camera, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ScanStatus = "scanning" | "loading" | "valid" | "used" | "invalid";

interface PassInfo {
  participantName?: string;
  passId?: string;
  eventName?: string;
}

export default function Scan() {
  const [status, setStatus] = useState<ScanStatus>("scanning");
  const [passInfo, setPassInfo] = useState<PassInfo>({});
  const [scannedToken, setScannedToken] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const html5QrRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = "qr-reader";
  const markUsed = useMarkPassUsed();

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try {
        const state = html5QrRef.current.getState();
        if (state === 2) {
          await html5QrRef.current.stop();
        }
      } catch {}
    }
  };

  const startScanner = () => {
    setStatus("scanning");
    setPassInfo({});
    setScannedToken("");
    setErrorMsg("");

    setTimeout(() => {
      const qr = new Html5Qrcode(scannerDivId);
      html5QrRef.current = qr;

      qr.start(
        { facingMode: "environment" },
        { fps: 15, qrbox: { width: 260, height: 260 } },
        async (decodedText) => {
          await stopScanner();
          setScannedToken(decodedText);
          setStatus("loading");
          await validateToken(decodedText);
        },
        () => {}
      ).catch(() => {
        qr.start(
          { facingMode: "user" },
          { fps: 15, qrbox: { width: 260, height: 260 } },
          async (decodedText) => {
            await stopScanner();
            setScannedToken(decodedText);
            setStatus("loading");
            await validateToken(decodedText);
          },
          () => {}
        ).catch(() => {
          setErrorMsg("Camera access denied. Please allow camera permission and try again.");
          setStatus("invalid");
        });
      });
    }, 100);
  };

  const validateToken = async (token: string) => {
    try {
      const res = await fetch(`/api/passes/validate/${encodeURIComponent(token)}`);
      const data = await res.json();
      setPassInfo({
        participantName: data.participantName,
        passId: data.passId,
        eventName: data.eventName,
      });
      if (data.status === "valid") setStatus("valid");
      else if (data.status === "used") setStatus("used");
      else setStatus("invalid");
    } catch {
      setStatus("invalid");
      setErrorMsg("Could not reach server. Check your connection.");
    }
  };

  const handleMarkUsed = () => {
    markUsed.mutate({ qrToken: scannedToken }, {
      onSuccess: () => setStatus("used"),
      onError: () => {},
    });
  };

  const handleReset = async () => {
    await stopScanner();
    startScanner();
  };

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50">
        <Loader2 className="w-16 h-16 text-white animate-spin mb-4" />
        <p className="text-white text-xl font-semibold">Validating pass…</p>
      </div>
    );
  }

  if (status === "valid") {
    return (
      <div className="fixed inset-0 bg-green-600 flex flex-col items-center justify-center z-50 px-6 text-center">
        <CheckCircle2 className="w-24 h-24 text-white mb-6 drop-shadow-lg" />
        <h1 className="text-5xl font-black text-white mb-2 tracking-wide">VALID</h1>
        <p className="text-green-100 text-lg mb-8 font-medium">Pass is verified ✓</p>
        {passInfo.participantName && (
          <div className="bg-white/20 backdrop-blur rounded-2xl px-8 py-5 mb-8 text-white space-y-1 w-full max-w-xs">
            <p className="text-sm text-green-100 uppercase tracking-wider font-semibold">Attendee</p>
            <p className="text-2xl font-bold">{passInfo.participantName}</p>
            {passInfo.passId && <p className="text-sm font-mono text-green-100">{passInfo.passId}</p>}
          </div>
        )}
        <Button
          onClick={handleMarkUsed}
          disabled={markUsed.isPending}
          className="bg-white text-green-700 hover:bg-green-50 font-bold text-base px-10 py-3 rounded-full mb-4 shadow-lg"
        >
          {markUsed.isPending ? "Marking…" : "Mark as Used & Continue"}
        </Button>
        <button onClick={handleReset} className="text-green-100 text-sm underline">
          Scan another pass
        </button>
      </div>
    );
  }

  if (status === "used") {
    return (
      <div className="fixed inset-0 bg-amber-500 flex flex-col items-center justify-center z-50 px-6 text-center">
        <AlertTriangle className="w-24 h-24 text-white mb-6 drop-shadow-lg" />
        <h1 className="text-5xl font-black text-white mb-2 tracking-wide">ALREADY USED</h1>
        <p className="text-amber-100 text-lg mb-8 font-medium">This pass has been scanned before</p>
        {passInfo.participantName && (
          <div className="bg-white/20 backdrop-blur rounded-2xl px-8 py-5 mb-8 text-white space-y-1 w-full max-w-xs">
            <p className="text-sm text-amber-100 uppercase tracking-wider font-semibold">Attendee</p>
            <p className="text-2xl font-bold">{passInfo.participantName}</p>
            {passInfo.passId && <p className="text-sm font-mono text-amber-100">{passInfo.passId}</p>}
          </div>
        )}
        <button
          onClick={handleReset}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white font-semibold px-8 py-3 rounded-full transition-colors"
        >
          <RotateCcw size={18} /> Scan Next
        </button>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="fixed inset-0 bg-red-600 flex flex-col items-center justify-center z-50 px-6 text-center">
        <XCircle className="w-24 h-24 text-white mb-6 drop-shadow-lg" />
        <h1 className="text-5xl font-black text-white mb-2 tracking-wide">INVALID</h1>
        <p className="text-red-100 text-lg mb-8 font-medium">
          {errorMsg || "This pass is not recognized"}
        </p>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white font-semibold px-8 py-3 rounded-full transition-colors"
        >
          <RotateCcw size={18} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col z-50">
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div className="flex items-center gap-2.5">
          <Camera className="text-white w-5 h-5" />
          <span className="text-white font-semibold text-lg">Pass Scanner</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-xs font-medium">Live</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <p className="text-gray-400 text-sm mb-6 text-center">
          Point camera at a QR code on the pass
        </p>

        <div className="relative w-full max-w-xs">
          <div
            id={scannerDivId}
            className="rounded-2xl overflow-hidden w-full aspect-square"
          />
          <div className="absolute inset-0 pointer-events-none rounded-2xl">
            <div className="absolute top-3 left-3 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-lg" />
            <div className="absolute top-3 right-3 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-lg" />
            <div className="absolute bottom-3 left-3 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-lg" />
            <div className="absolute bottom-3 right-3 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-lg" />
          </div>
        </div>

        <p className="text-gray-500 text-xs mt-6 text-center max-w-[220px]">
          Scanning automatically — no button needed
        </p>
      </div>
    </div>
  );
}
