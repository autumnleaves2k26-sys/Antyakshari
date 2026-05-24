import { Link } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Clock, Music, Users, Sparkles, Zap, ChevronDown, Instagram, Twitter, Facebook, ArrowRight, CheckCircle } from "lucide-react";
import autumnLogo from "@assets/autumn_leaves_events_1779631833747.jpeg";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const highlights = [
  {
    icon: <Music size={22} />,
    title: "Live Music",
    desc: "Soulful performances, impromptu jamming sessions, and pure musical energy.",
  },
  {
    icon: <Zap size={22} />,
    title: "Crowd Energy",
    desc: "Feel the pulse of a room full of music lovers — electric and unforgettable.",
  },
  {
    icon: <Sparkles size={22} />,
    title: "Fun & Games",
    desc: "Antyakshari battles, competitions, and spontaneous moments worth remembering.",
  },
  {
    icon: <Users size={22} />,
    title: "Community",
    desc: "Meet people who understand music the way you do. Leave with new friends.",
  },
];

const rules = [
  "All participants must carry a valid printed or digital pass for entry.",
  "Respect the performers and fellow attendees at all times.",
  "No alcohol or prohibited substances on venue premises.",
  "Registration is non-refundable once confirmed.",
  "Participants must arrive before 7:00 PM. Late entry may not be permitted.",
  "Photography is allowed, but please do not disrupt ongoing performances.",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16 border-b border-border">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_60%,hsl(220,13%,96%))]" />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            custom={0} variants={fadeUp} initial="hidden" animate="visible"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-white text-xs font-medium text-muted-foreground mb-8 shadow-xs"
          >
            <img src={autumnLogo} alt="" className="h-4 w-4 rounded-full object-cover" />
            Autumn Leaves Events Presents
          </motion.div>

          <motion.h1
            custom={1} variants={fadeUp} initial="hidden" animate="visible"
            className="font-serif text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[9.5rem] font-black leading-[0.9] text-foreground mb-6 italic tracking-tight"
            data-testid="hero-title"
          >
            Antyakshari
          </motion.h1>

          <motion.p
            custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="font-serif text-xl sm:text-2xl text-muted-foreground italic mb-8"
            data-testid="hero-subtitle"
          >
            more than a jamming
          </motion.p>

          <motion.div
            custom={3} variants={fadeUp} initial="hidden" animate="visible"
            className="flex items-center justify-center gap-6 mb-12 text-sm text-muted-foreground"
            data-testid="hero-date"
          >
            <span className="flex items-center gap-2">
              <Clock size={15} className="text-primary" />
              31st May 2026
            </span>
            <span className="w-px h-4 bg-border" />
            <span className="flex items-center gap-2">
              <MapPin size={15} className="text-primary" />
              Venue TBA
            </span>
          </motion.div>

          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-7 py-3 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
              data-testid="hero-cta"
            >
              Register Now <ArrowRight size={16} />
            </Link>
            <a
              href="#about"
              className="inline-flex items-center gap-2 px-7 py-3 bg-white text-foreground font-semibold text-sm rounded-lg border border-border hover:bg-muted transition-colors shadow-xs"
            >
              Learn More
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground/40 animate-bounce"
        >
          <ChevronDown size={20} />
        </motion.div>
      </section>

      {/* ─── ABOUT ─── */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
            >
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">About the Event</p>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight" data-testid="about-title">
                Where Music<br />Meets Memories
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Antyakshari is not just an event — it is a celebration of everything music means to us.
                Born from the spirit of spontaneous singing and shared melodies, this gathering brings
                together students, artists, and music lovers for an evening that transcends the ordinary.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Come sing, laugh, connect, and leave with a story worth telling.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { label: "31st May 2026", sub: "Event Date" },
                { label: "₹199", sub: "Per Pass" },
                { label: "6 PM", sub: "Doors Open" },
                { label: "Live", sub: "Music & Games" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-border rounded-xl p-6 shadow-xs">
                  <p className="font-serif text-3xl font-bold text-foreground mb-1">{stat.label}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.sub}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── HIGHLIGHTS ─── */}
      <section className="py-20 px-6 bg-muted/40 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">What to Expect</p>
            <h2 className="font-serif text-4xl font-bold text-foreground">Event Highlights</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {highlights.map((h, i) => (
              <motion.div
                key={h.title}
                custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="bg-white rounded-xl border border-border p-6 shadow-xs hover:shadow-sm transition-shadow"
                data-testid={`highlight-card-${i}`}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {h.icon}
                </div>
                <h3 className="font-semibold text-foreground text-base mb-2">{h.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{h.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            data-testid="pricing-section"
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">Passes & Pricing</p>
            <h2 className="font-serif text-4xl font-bold text-foreground mb-10">Your Ticket In</h2>

            <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-10 border-b md:border-b-0 md:border-r border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Standard Pass</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="font-serif text-6xl font-black text-primary">₹199</span>
                    <span className="text-muted-foreground text-sm">/ person</span>
                  </div>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary/90 transition-colors"
                    data-testid="pricing-cta"
                  >
                    Book Your Pass <ArrowRight size={15} />
                  </Link>
                </div>
                <div className="p-10">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4 font-medium">Includes</p>
                  <ul className="space-y-3">
                    {[
                      "Full event access",
                      "Antyakshari competition entry",
                      "Live music experience",
                      "Digital pass on approval",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-foreground">
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
      <section className="py-20 px-6 bg-muted/40 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">Guidelines</p>
            <h2 className="font-serif text-4xl font-bold text-foreground">Event Rules</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rules.map((rule, i) => (
              <motion.div
                key={i}
                custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="flex gap-4 items-start bg-white rounded-xl border border-border px-5 py-4 shadow-xs"
                data-testid={`rule-item-${i}`}
              >
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed">{rule}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VENUE ─── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            data-testid="venue-section"
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">Logistics</p>
            <h2 className="font-serif text-4xl font-bold text-foreground mb-10">Venue & Timing</h2>

            <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
                <div className="p-10 flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <Clock size={20} />
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Date & Time</p>
                  <p className="font-serif text-2xl font-bold text-foreground">31st May 2026</p>
                  <p className="text-muted-foreground text-sm">6:00 PM onwards</p>
                </div>
                <div className="p-10 flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <MapPin size={20} />
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Venue</p>
                  <p className="font-serif text-2xl font-bold text-foreground">To Be Announced</p>
                  <p className="text-muted-foreground text-sm">Registered attendees will be notified</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 px-6 bg-foreground text-white">
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
      <footer className="border-t border-border py-10 px-6 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <img src={autumnLogo} alt="Autumn Leaves Events" className="h-9 w-auto rounded object-contain" />
            <div>
              <p className="text-xs font-semibold text-foreground">Autumn Leaves Events</p>
              <p className="text-xs text-muted-foreground">We Plan Your Party</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Autumn Leaves Events. All rights reserved.</p>
          <div className="flex gap-4 text-muted-foreground">
            <a href="#" aria-label="Instagram" className="hover:text-primary transition-colors" data-testid="footer-instagram"><Instagram size={17} /></a>
            <a href="#" aria-label="Twitter" className="hover:text-primary transition-colors" data-testid="footer-twitter"><Twitter size={17} /></a>
            <a href="#" aria-label="Facebook" className="hover:text-primary transition-colors" data-testid="footer-facebook"><Facebook size={17} /></a>
          </div>
        </div>
      </footer>
    </main>
  );
}
