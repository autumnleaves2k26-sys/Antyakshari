import { useState, useRef, useEffect } from "react";
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
import { QrCode, Upload, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

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
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      totalPasses: 1,
    }
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
    const currentLength = fields.length;
    const targetLength = totalPasses;
    if (targetLength > currentLength) {
      const additional = Array(targetLength - currentLength).fill({ participantName: "", age: undefined, collegeOrCompany: "" });
      replace([...form2.getValues().participants, ...additional]);
    } else if (targetLength < currentLength) {
      replace(form2.getValues().participants.slice(0, targetLength));
    }
  }, [totalPasses, fields.length, replace, form2]);

  const onStep1Submit = (data: Step1Values) => {
    setStep(2);
  };

  const onStep2Submit = async (data: Step2Values) => {
    const step1Data = form1.getValues();
    const payload = {
      name: step1Data.name,
      email: step1Data.email,
      phone: step1Data.phone,
      totalPasses: step1Data.totalPasses,
      participants: data.participants.map(p => ({
        participantName: p.participantName,
        age: p.age === '' ? null : Number(p.age),
        collegeOrCompany: p.collegeOrCompany || null
      }))
    };

    createRegistration.mutate({ data: payload }, {
      onSuccess: (res) => {
        setBookingId(res.bookingId);
        setStep(3);
      },
      onError: (err) => {
        toast({ title: "Registration failed", description: "Please try again later.", variant: "destructive" });
      }
    });
  };

  const onPaymentSubmit = () => {
    if (!screenshotUrl) {
      toast({ title: "Screenshot required", description: "Please provide a valid URL for your payment screenshot", variant: "destructive" });
      return;
    }
    if (!bookingId) return;

    uploadScreenshot.mutate({ bookingId, data: { screenshotUrl } }, {
      onSuccess: () => {
        setStep(4);
      },
      onError: () => {
        toast({ title: "Upload failed", description: "Could not submit payment screenshot.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center min-h-[80dvh] items-center">
      <Card className="w-full max-w-2xl bg-card border-border shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-in-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <CardHeader className="text-center pt-10">
          <CardTitle className="font-serif text-3xl font-bold">Secure Your Passes</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            {step === 1 && "Step 1: Your Contact Information"}
            {step === 2 && "Step 2: Participant Details"}
            {step === 3 && "Step 3: Payment"}
            {step === 4 && "Registration Complete"}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 md:p-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Form {...form1}>
                  <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-6">
                    <FormField control={form1.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="John Doe" {...field} data-testid="input-name" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form1.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl><Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form1.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl><Input type="tel" placeholder="1234567890" {...field} data-testid="input-phone" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form1.control} name="totalPasses" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Passes</FormLabel>
                        <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger data-testid="select-passes">
                              <SelectValue placeholder="Select passes" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[...Array(10)].map((_, i) => (
                              <SelectItem key={i+1} value={(i+1).toString()}>{i+1}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full" data-testid="button-next-1">
                      Continue <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Form {...form2}>
                  <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-8">
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-4 border border-border rounded-lg bg-background/50 space-y-4">
                        <h4 className="font-medium text-primary">Participant {index + 1}</h4>
                        <FormField control={form2.control} name={`participants.${index}.participantName`} render={({ field: f }) => (
                          <FormItem>
                            <FormLabel>Name *</FormLabel>
                            <FormControl><Input placeholder="Name" {...f} data-testid={`input-participant-name-${index}`} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={form2.control} name={`participants.${index}.age`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Age</FormLabel>
                              <FormControl><Input type="number" placeholder="Optional" {...f} value={f.value || ''} data-testid={`input-participant-age-${index}`} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form2.control} name={`participants.${index}.collegeOrCompany`} render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>College/Company</FormLabel>
                              <FormControl><Input placeholder="Optional" {...f} data-testid={`input-participant-org-${index}`} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-4">
                      <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full">
                        <ArrowLeft className="mr-2 w-4 h-4" /> Back
                      </Button>
                      <Button type="submit" className="w-full" disabled={createRegistration.isPending} data-testid="button-submit-participants">
                        {createRegistration.isPending ? "Processing..." : "Proceed to Payment"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="space-y-8 text-center">
                  <div className="bg-background border border-border p-8 rounded-2xl mx-auto w-64 aspect-square flex flex-col items-center justify-center gap-4">
                    <QrCode className="w-24 h-24 text-primary/50" />
                    <p className="text-sm text-muted-foreground">Scan to Pay TBA</p>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      After making the payment, please upload a link to your screenshot.
                    </p>
                    <div className="flex flex-col gap-2 max-w-sm mx-auto">
                      <Input 
                        placeholder="Paste image URL here" 
                        value={screenshotUrl}
                        onChange={(e) => setScreenshotUrl(e.target.value)}
                        data-testid="input-screenshot-url"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={onPaymentSubmit} 
                    className="w-full max-w-sm mx-auto" 
                    size="lg"
                    disabled={uploadScreenshot.isPending}
                    data-testid="button-submit-payment"
                  >
                    <Upload className="mr-2 w-4 h-4" />
                    {uploadScreenshot.isPending ? "Uploading..." : "I've Paid & Uploaded"}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                <CheckCircle2 className="w-20 h-20 text-primary mx-auto mb-6" />
                <h3 className="font-serif text-3xl font-bold mb-4">Registration Received!</h3>
                <p className="text-muted-foreground mb-6">
                  Your booking ID is <span className="font-mono text-primary font-bold">{bookingId}</span>
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
                  Your registration is pending approval. You can check your status anytime using your booking ID.
                </p>
                <Button onClick={() => setLocation(`/booking/${bookingId}`)} data-testid="button-view-status">
                  View Booking Status
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
