import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Clock, ChevronDown, Instagram, ArrowRight, CheckCircle } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import autumnLogo from "@assets/autumn_leaves_events_1779631833747.jpeg";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const rules = [
  "All participants must carry a valid printed or digital pass for entry.",
  "Respect the performers and fellow attendees at all times.",
  "No alcohol or prohibited substances on venue premises.",
  "Registration is non-refundable once confirmed.",
  "Participants must arrive before 7:00 PM. Late entry may not be permitted.",
  "Photography is allowed, but please do not disrupt ongoing performances.",
];

export default function Home() {
  const VIDEO_URL = "https://res.cloudinary.com/dzugz2por/video/upload/q_auto,f_auto,w_854,br_1m/v1779642240/antyakshari_bg_vid_ppzgc6.mp4";
  const [videoSrc, setVideoSrc] = useState(VIDEO_URL);

  useEffect(() => {
    let objectUrl: string | null = null;
    const cacheName = "antyakshari-video-cache";

    async function initVideoCache() {
      try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(VIDEO_URL);

        if (cachedResponse) {
          const blob = await cachedResponse.blob();
          objectUrl = URL.createObjectURL(blob);
          setVideoSrc(objectUrl);
        } else {
          // Fetch the video file and cache it in the background
          fetch(VIDEO_URL)
            .then(async (response) => {
              if (response.ok) {
                await cache.put(VIDEO_URL, response.clone());
              }
            })
            .catch((err) => console.warn("Background video caching failed:", err));
        }
      } catch (err) {
        console.error("Cache storage failed:", err);
      }
    }

    initVideoCache();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, []);

  return (
    <main className="relative isolate min-h-screen overflow-x-hidden bg-black text-white">
      <div className="fixed inset-0 -z-20 pointer-events-none">
        <video
          className="absolute inset-0 h-full w-full object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          src={videoSrc}
        />
        <div className="absolute inset-0 bg-black/48" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.42)_38%,rgba(0,0,0,0.82)_100%)]" />
      </div>

      {/* ─── HERO ─── */}
      <section className="relative -mt-20 min-h-[calc(100vh+5rem)] flex flex-col items-center justify-center overflow-hidden pt-24 border-b border-white/10 bg-transparent">
        <div className="absolute top-0 right-0 z-10 h-24 w-72 bg-gradient-to-l from-black/90 via-black/55 to-transparent" />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            custom={0} variants={fadeUp} initial="hidden" animate="visible"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-xs font-medium text-white/80 mb-8"
          >
            <img src={autumnLogo} alt="" className="h-4 w-4 rounded-full object-cover" />
            Autumn Leaves Events Presents
          </motion.div>

          <motion.h1
            custom={1} variants={fadeUp} initial="hidden" animate="visible"
            className="font-serif text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[9.5rem] font-black leading-[0.9] text-white mb-6 italic tracking-tight"
            data-testid="hero-title"
          >
            Antyakshari
          </motion.h1>

          <motion.p
            custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="font-serif text-xl sm:text-2xl text-white/70 italic mb-8"
            data-testid="hero-subtitle"
          >
            more than a jamming
          </motion.p>

          <motion.div
            custom={3} variants={fadeUp} initial="hidden" animate="visible"
            className="flex items-center justify-center gap-6 mb-12 text-sm text-white/60"
            data-testid="hero-date"
          >
            <span className="flex items-center gap-2">
              <Clock size={15} className="text-primary" />
              31st May 2026
            </span>
            <span className="w-px h-4 bg-white/20" />
            <span className="flex items-center gap-2">
              <MapPin size={15} className="text-primary" />
              PRAKRUTHI RESTAURANT, Karminagar
            </span>
          </motion.div>

          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex h-14 min-w-[180px] items-center justify-center gap-2 px-7 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
              data-testid="hero-cta"
            >
              Register Now <ArrowRight size={16} />
            </Link>
            <a
              href="https://www.instagram.com/autumnleaves.eventco"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-14 min-w-[180px] items-center justify-center gap-2 px-7 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f58529_0%,#feda77_22%,#dd2a7b_52%,#8134af_78%,#515bd4_100%)] shadow-sm">
                <SiInstagram size={13} aria-hidden="true" className="text-white" />
              </span>
              Follow us on Instagram
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 animate-bounce"
        >
          <ChevronDown size={20} />
        </motion.div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="relative overflow-hidden py-20 px-6 border-y border-white/10 bg-black/14 backdrop-blur-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%),linear-gradient(to_bottom,rgba(0,0,0,0.12),rgba(0,0,0,0.35))]" />
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            data-testid="pricing-section"
            className="relative z-10"
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary/90 mb-3">Passes & Pricing</p>
            <h2 className="font-serif text-4xl font-bold text-white mb-10">Your Ticket In</h2>

            <div className="bg-slate-950/56 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl shadow-black/24 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-10 border-b md:border-b-0 md:border-r border-white/10">
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-3 font-medium">Standard Pass</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="font-serif text-6xl font-black text-white">₹139</span>
                    <span className="text-white/60 text-sm">/ person</span>
                  </div>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:scale-[1.02] hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    data-testid="pricing-cta"
                  >
                    Book Your Pass <ArrowRight size={15} />
                  </Link>
                </div>
                <div className="p-10">
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-4 font-medium">Includes</p>
                  <ul className="space-y-3">
                    {[
                      "Full event access",
                      "Antyakshari competition entry",
                      "Live music experience",
                      "Fast digital pass delivery",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-white/90">
                        <CheckCircle size={15} className="text-primary flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── RULES ─── */}
      <section className="py-20 px-6 border-y border-white/10 bg-black/12 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">Guidelines</p>
            <h2 className="font-serif text-4xl font-bold text-white">Event Rules</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rules.map((rule, i) => (
              <motion.div
                key={i}
                custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="flex gap-4 items-start bg-white/8 rounded-xl border border-white/10 px-5 py-4 shadow-sm backdrop-blur-md"
                data-testid={`rule-item-${i}`}
              >
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-white/75 leading-relaxed">{rule}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VENUE ─── */}
      <section className="py-20 px-6 bg-black/12 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            data-testid="venue-section"
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">Location Preview</p>
            <h2 className="font-serif text-4xl font-bold text-white mb-10">Where to Find Us</h2>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/35 backdrop-blur-md shadow-2xl shadow-black/30">
              <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
                <div className="p-10 lg:p-12 flex flex-col justify-between gap-8 border-b lg:border-b-0 lg:border-r border-white/10">
                  <div className="space-y-4">
                    <div>
                      <p className="font-serif text-3xl sm:text-4xl font-bold text-white">PRAKRUTHI RESTAURANT</p>
                      <p className="mt-2 text-white/70 text-sm">Karminagar</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/8 p-5">
                      <p className="text-xs text-white/55 uppercase tracking-wider font-medium mb-2">Date & Time</p>
                      <p className="font-serif text-2xl font-bold text-white">31st May 2026</p>
                      <p className="text-white/70 text-sm">6:00 PM onwards</p>
                    </div>
                  </div>
                </div>

                <div className="relative min-h-[360px] bg-black">
                  <iframe
                    title="PRAKRUTHI RESTAURANT map preview"
                    src={`https://www.google.com/maps?q=${encodeURIComponent("PRAKRUTHI RESTAURANT, Karminagar")}&output=embed`}
                    className="absolute inset-0 h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.36),transparent_30%)]" />
                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-black/55 px-4 py-3 backdrop-blur-md">
                    <p className="text-xs uppercase tracking-[0.2em] text-primary mb-1">Preview</p>
                    <p className="font-semibold text-white">PRAKRUTHI RESTAURANT, Karminagar</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 px-6 bg-black/24 backdrop-blur-sm text-white border-y border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-4 italic" data-testid="final-cta-title">
            Don't miss a note.
          </h2>
          <p className="text-white/60 mb-10 leading-relaxed">
            Seats are limited. Register today and secure your place at the most memorable evening of the year.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            data-testid="final-cta-button"
          >
            Register Now <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-slate-200/80 py-12 px-6 bg-white text-slate-600 shadow-inner">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-65 transition duration-500"></div>
              <img 
                src={autumnLogo} 
                alt="Autumn Leaves Events" 
                className="relative h-10 w-10 rounded-full object-cover border border-slate-100 shadow-sm" 
              />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 tracking-wide">Autumn Leaves Events</p>
              <p className="text-[10px] text-slate-400 italic">We Plan Your Party</p>
            </div>
          </div>
          <div className="text-center sm:text-left flex flex-col gap-1">
            <p className="text-xs text-slate-500">
              For queries:{" "}
              <a 
                href="tel:+917893949045" 
                className="font-semibold text-slate-800 hover:text-primary transition-colors"
              >
                +91 78939 49045
              </a>
            </p>
            <p className="text-[10px] text-slate-400">© 2026 Autumn Leaves Events. All rights reserved.</p>
          </div>
          <div className="flex gap-4 items-center">
            <a 
              href="https://www.instagram.com/autumnleaves.eventco" 
              target="_blank" 
              rel="noreferrer" 
              aria-label="Instagram" 
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:text-white hover:bg-gradient-to-tr hover:from-[#feda77] hover:via-[#dd2a7b] hover:to-[#8134af] border border-slate-100 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5" 
              data-testid="footer-instagram"
            >
              <Instagram size={17} />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
