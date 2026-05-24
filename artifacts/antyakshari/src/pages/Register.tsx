import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateRegistration, useUploadPaymentScreenshot } from "@workspace/api-client-react";
import { QrCode, Upload, ArrowRight, ArrowLeft, CheckCircle2, Users } from "lucide-react";

const step1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  totalPasses: z.coerce.number().min(1).max(10),
});

const step2Schema = z.object({
  participants: z.array(z.object({
    participantName: z.string().min(2, "Name required"),
    age: z.coerce.number().optional().or(z.literal('')),
    collegeOrCompany: z.string().optional(),
  }))
});

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;

const slide = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState("");

  const createRegistration = useCreateRegistration();
  const uploadScreenshot = useUploadPaymentScreenshot();

  const form1 = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { name: "", email: "", phone: "", totalPasses: 1 }
  });

  const totalPasses = form1.watch("totalPasses");

  const form2 = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      participants: [{ participantName: "", age: undefined, collegeOrCompany: "" }]
    }
  });

  const { fields, replace } = useFieldArray({
    control: form2.control,
    name: "participants"
  });

  useEffect(() => {
    const additionalCount = Number(totalPasses) - 1;
    if (additionalCount < 0) return;
    const current = form2.getValues().participants;
    if (current.length === additionalCount) return;
    const blank = { participantName: "", age: undefined as undefined, collegeOrCompany: "" };
    if (additionalCount > current.length) {
      replace([...current, ...Array(additionalCount - current.length).fill(blank)]);
    } else {
      replace(current.slice(0, additionalCount));
    }
  }, [totalPasses]);

  const onStep1Submit = (data: Step1Values) => {
    if (data.totalPasses === 1) {
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const onStep2Submit = async (data: Step2Values) => {
    const step1Data = form1.getValues();
    const allParticipants = [
      { participantName: step1Data.name, age: null, collegeOrCompany: null },
      ...data.participants.map(p => ({
        participantName: p.participantName,
        age: p.age === '' ? null : (p.age ? Number(p.age) : null),
        collegeOrCompany: p.collegeOrCompany || null
      }))
    ];

    createRegistration.mutate({
      data: {
        name: step1Data.name,
        email: step1Data.email,
        phone: step1Data.phone,
        totalPasses: step1Data.totalPasses,
        participants: allParticipants
      }
    }, {
      onSuccess: (res) => { setBookingId(res.bookingId); setStep(3); },
      onError: () => toast({ title: "Registration failed", description: "Please try again later.", variant: "destructive" })
    });
  };

  const submitSinglePassRegistration = () => {
    const step1Data = form1.getValues();
    createRegistration.mutate({
      data: {
        name: step1Data.name,
        email: step1Data.email,
        phone: step1Data.phone,
        totalPasses: 1,
        participants: [{ participantName: step1Data.name, age: null, collegeOrCompany: null }]
      }
    }, {
      onSuccess: (res) => { setBookingId(res.bookingId); setStep(4); },
      onError: () => toast({ title: "Registration failed", description: "Please try again later.", variant: "destructive" })
    });
  };

  const onPaymentSubmit = () => {
    if (!screenshotUrl) {
      toast({ title: "Screenshot required", description: "Please provide a valid URL for your payment screenshot.", variant: "destructive" });
      return;
    }
    if (!bookingId) {
      submitSinglePassRegistration();
      return;
    }
    uploadScreenshot.mutate({ bookingId, data: { screenshotUrl } }, {
      onSuccess: () => setStep(4),
      onError: () => toast({ title: "Upload failed", description: "Could not submit payment screenshot.", variant: "destructive" })
    });
  };

  const handlePaymentAndRegister = () => {
    const totalP = form1.getValues().totalPasses;
    if (totalP === 1) {
      if (!screenshotUrl) {
        toast({ title: "Screenshot required", description: "Please provide a valid URL for your payment screenshot.", variant: "destructive" });
        return;
      }
      submitSinglePassWithScreenshot();
    } else {
      if (!screenshotUrl) {
        toast({ title: "Screenshot required", description: "Please provide a valid URL for your payment screenshot.", variant: "destructive" });
        return;
      }
      if (!bookingId) return;
      uploadScreenshot.mutate({ bookingId, data: { screenshotUrl } }, {
        onSuccess: () => setStep(4),
        onError: () => toast({ title: "Upload failed", description: "Could not submit.", variant: "destructive" })
      });
    }
  };

  const submitSinglePassWithScreenshot = () => {
    const step1Data = form1.getValues();
    createRegistration.mutate({
      data: {
        name: step1Data.name,
        email: step1Data.email,
        phone: step1Data.phone,
        totalPasses: 1,
        participants: [{ participantName: step1Data.name, age: null, collegeOrCompany: null }]
      }
    }, {
      onSuccess: (res) => {
        const bId = res.bookingId;
        setBookingId(bId);
        uploadScreenshot.mutate({ bookingId: bId, data: { screenshotUrl } }, {
          onSuccess: () => setStep(4),
          onError: () => toast({ title: "Registration saved", description: "But screenshot upload failed. Use your booking ID to update it.", variant: "destructive" })
        });
      },
      onError: () => toast({ title: "Registration failed", description: "Please try again later.", variant: "destructive" })
    });
  };

  const totalSteps = totalPasses > 1 ? 4 : 3;
  const currentStepDisplay = step <= 2 ? step : (totalPasses > 1 ? step : step - 1);

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-2">Event Registration</p>
          <h1 className="font-serif text-4xl font-bold text-foreground">Secure Your Passes</h1>
        </div>

        <Card className="bg-white border-border shadow-sm">
          <div className="h-1 bg-muted rounded-t-xl overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${(step / (totalPasses > 1 ? 4 : 3)) * 100}%` }}
            />
          </div>

          <CardHeader className="pb-2 pt-7 px-8">
            <CardDescription className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
              {step === 1 && "Step 1 — Contact Information"}
              {step === 2 && `Step 2 — Additional Members (${totalPasses - 1} more)`}
              {step === 3 && (totalPasses > 1 ? "Step 3 — Payment" : "Step 2 — Payment")}
              {step === 4 && "Registration Complete"}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <AnimatePresence mode="wait">

              {/* STEP 1 */}
              {step === 1 && (
                <motion.div key="step1" initial="enter" animate="center" exit="exit" variants={slide} transition={{ duration: 0.25 }}>
                  <Form {...form1}>
                    <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-5">
                      <FormField control={form1.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} className="bg-white" data-testid="input-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form1.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} className="bg-white" data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form1.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="10-digit mobile number" {...field} className="bg-white" data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form1.control} name="totalPasses" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Number of Passes</FormLabel>
                          <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value.toString()}>
                            <FormControl>
                              <SelectTrigger className="bg-white" data-testid="select-passes">
                                <SelectValue placeholder="Select passes" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[...Array(10)].map((_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                  {i + 1} {i === 0 ? "pass (just me)" : `passes`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <Button type="submit" className="w-full mt-2" data-testid="button-next-1">
                        Continue <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </form>
                  </Form>
                </motion.div>
              )}

              {/* STEP 2 — Additional Members Only */}
              {step === 2 && (
                <motion.div key="step2" initial="enter" animate="center" exit="exit" variants={slide} transition={{ duration: 0.25 }}>
                  <div className="mb-5 p-3 rounded-lg bg-muted/50 border border-border flex items-center gap-3">
                    <Users size={16} className="text-primary flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Pass 1 is registered for <span className="font-semibold text-foreground">{form1.getValues().name}</span>.
                      Please fill in details for the remaining {totalPasses - 1} member{totalPasses > 2 ? "s" : ""}.
                    </p>
                  </div>

                  <Form {...form2}>
                    <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-6">
                      {fields.map((field, index) => (
                        <div key={field.id} className="p-5 border border-border rounded-xl bg-muted/20 space-y-4">
                          <h4 className="text-sm font-semibold text-foreground">
                            Additional Member {index + 1}
                            <span className="ml-2 text-xs font-normal text-muted-foreground">(Pass {index + 2})</span>
                          </h4>
                          <FormField control={form2.control} name={`participants.${index}.participantName`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Member's full name" {...f} className="bg-white" data-testid={`input-participant-name-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={form2.control} name={`participants.${index}.age`} render={({ field: f }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Age</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="Optional" {...f} value={f.value || ''} className="bg-white" data-testid={`input-participant-age-${index}`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form2.control} name={`participants.${index}.collegeOrCompany`} render={({ field: f }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">College / Company</FormLabel>
                                <FormControl>
                                  <Input placeholder="Optional" {...f} className="bg-white" data-testid={`input-participant-org-${index}`} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                          <ArrowLeft className="mr-2 w-4 h-4" /> Back
                        </Button>
                        <Button type="submit" className="flex-1" disabled={createRegistration.isPending} data-testid="button-submit-participants">
                          {createRegistration.isPending ? "Processing..." : "Continue to Payment"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </motion.div>
              )}

              {/* STEP 3 — Payment */}
              {step === 3 && (
                <motion.div key="step3" initial="enter" animate="center" exit="exit" variants={slide} transition={{ duration: 0.25 }}>
                  <div className="space-y-6">
                    <div className="bg-muted/40 border border-border rounded-xl p-6 flex flex-col items-center gap-3 text-center">
                      <QrCode className="w-14 h-14 text-muted-foreground/40" />
                      <div>
                        <p className="font-semibold text-foreground text-sm">Scan to Pay</p>
                        <p className="text-xs text-muted-foreground mt-1">UPI payment details will be shared here</p>
                      </div>
                      <div className="mt-2 px-5 py-2 bg-primary/10 rounded-lg border border-primary/20 text-center">
                        <p className="text-xs text-muted-foreground">Amount to pay</p>
                        <p className="font-serif text-2xl font-bold text-primary">₹{199 * form1.getValues().totalPasses}</p>
                        <p className="text-xs text-muted-foreground">{form1.getValues().totalPasses} pass{form1.getValues().totalPasses > 1 ? "es" : ""} × ₹199</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Payment Screenshot URL *
                      </label>
                      <Input
                        placeholder="Paste the image link of your payment screenshot"
                        value={screenshotUrl}
                        onChange={(e) => setScreenshotUrl(e.target.value)}
                        className="bg-white"
                        data-testid="input-screenshot-url"
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">Upload your screenshot to Google Photos / Drive and paste the public link here.</p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(totalPasses > 1 ? 2 : 1)}
                        className="flex-1"
                      >
                        <ArrowLeft className="mr-2 w-4 h-4" /> Back
                      </Button>
                      <Button
                        onClick={handlePaymentAndRegister}
                        className="flex-1"
                        disabled={createRegistration.isPending || uploadScreenshot.isPending}
                        data-testid="button-submit-payment"
                      >
                        <Upload className="mr-2 w-4 h-4" />
                        {(createRegistration.isPending || uploadScreenshot.isPending) ? "Submitting..." : "Submit Registration"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4 — Done */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold mb-3 text-foreground">Registration Received!</h3>
                  <div className="inline-block px-4 py-2 bg-muted rounded-lg border border-border mb-4">
                    <p className="text-xs text-muted-foreground mb-0.5">Your Booking ID</p>
                    <p className="font-mono font-bold text-foreground text-sm">{bookingId}</p>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-7">
                    Your registration is pending admin approval. You'll be notified once your passes are issued. Save your Booking ID.
                  </p>
                  <Button onClick={() => setLocation(`/booking/${bookingId}`)} data-testid="button-view-status">
                    View Booking Status <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </motion.div>
              )}

            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
