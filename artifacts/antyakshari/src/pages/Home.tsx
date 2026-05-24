import { Link } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Clock, Music, Users, Sparkles, Zap, ChevronDown, Instagram, Twitter, Facebook } from "lucide-react";
import autumnLogo from "@assets/autumn_leaves_events_1779631833747.jpeg";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const highlights = [
  {
    icon: <Music size={28} />,
    title: "Live Music",
    desc: "Soulful performances, impromptu jamming sessions, and pure musical energy that fills every corner.",
  },
  {
    icon: <Zap size={28} />,
    title: "Crowd Energy",
    desc: "Feel the pulse of a room full of music lovers — the kind of energy money can't recreate.",
  },
  {
    icon: <Sparkles size={28} />,
    title: "Fun & Games",
    desc: "Antyakshari battles, competitions, and spontaneous moments that become stories you tell for years.",
  },
  {
    icon: <Users size={28} />,
    title: "Community",
    desc: "Meet people who understand music the way you do. Leave with new friends and shared memories.",
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
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[140px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/8 blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "200px" }} />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.p
            custom={0} variants={fadeUp} initial="hidden" animate="visible"
            className="text-xs tracking-[0.3em] uppercase text-primary/80 font-semibold mb-6"
            data-testid="hero-presented-by"
          >
            Autumn Leaves Events presents
          </motion.p>

          <motion.h1
            custom={1} variants={fadeUp} initial="hidden" animate="visible"
            className="font-serif text-[4.5rem] sm:text-[7rem] md:text-[9rem] lg:text-[11rem] font-black leading-none text-foreground mb-4 italic"
            style={{ textShadow: "0 0 60px rgba(232,129,58,0.35)" }}
            data-testid="hero-title"
          >
            Antyakshari
          </motion.h1>

          <motion.p
            custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="font-serif text-xl sm:text-2xl md:text-3xl text-secondary/90 italic mb-8"
            data-testid="hero-subtitle"
          >
            more than a jamming
          </motion.p>

          <motion.div
            custom={3} variants={fadeUp} initial="hidden" animate="visible"
            className="flex items-center justify-center gap-3 mb-12"
            data-testid="hero-date"
          >
            <span className="h-px w-10 bg-primary/40" />
            <span className="text-sm tracking-[0.25em] uppercase text-muted-foreground font-medium">
              31st May 2026
            </span>
            <span className="h-px w-10 bg-primary/40" />
          </motion.div>

          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
            <Link
              href="/register"
              className="inline-block px-10 py-4 bg-primary text-primary-foreground font-semibold text-base rounded-full hover:scale-105 transition-transform duration-300"
              style={{ boxShadow: "0 0 30px rgba(232,129,58,0.35)" }}
              data-testid="hero-cta"
            >
              Register Now
            </Link>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground/30 animate-bounce"
        >
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* ─── ABOUT ─── */}
      <section className="py-24 px-4 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
        >
          <p className="text-xs tracking-[0.3em] uppercase text-primary/70 font-semibold mb-4">About the Event</p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-8" data-testid="about-title">
            Where Music Meets Memories
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Antyakshari is not just an event — it is a celebration of everything music means to us.
            Born from the spirit of spontaneous singing and shared melodies, this gathering brings
            together students, artists, and music lovers for an evening that transcends the ordinary.
            Come sing, laugh, connect, and leave with a story worth telling.
          </p>
        </motion.div>
      </section>

      {/* ─── HIGHLIGHTS ─── */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-primary/70 font-semibold mb-3">What to Expect</p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground">Event Highlights</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((h, i) => (
            <motion.div
              key={h.title}
              custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4 hover:border-primary/30 transition-all duration-300"
              data-testid={`highlight-card-${i}`}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {h.icon}
              </div>
              <h3 className="font-semibold text-foreground text-lg">{h.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{h.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="py-20 px-4 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="rounded-3xl border border-primary/20 bg-card p-10 sm:p-14"
          data-testid="pricing-section"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-primary/70 font-semibold mb-4">Passes & Pricing</p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-6">Your Ticket In</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
            <div className="flex flex-col items-center p-6 rounded-2xl bg-primary/10 border border-primary/20 min-w-[140px]">
              <span className="text-4xl font-black text-primary font-serif">₹199</span>
              <span className="text-xs text-muted-foreground mt-1 tracking-wide uppercase">Per Pass</span>
            </div>
            <div className="text-left max-w-xs">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Includes full access to the event, participation in Antyakshari rounds, live music, and an unforgettable evening.
                Passes are issued on approval of payment.
              </p>
            </div>
          </div>
          <Link
            href="/register"
            className="inline-block px-8 py-3.5 bg-primary text-primary-foreground rounded-full font-semibold hover:opacity-90 transition-opacity"
            data-testid="pricing-cta"
          >
            Book Your Pass
          </Link>
        </motion.div>
      </section>

      {/* ─── RULES ─── */}
      <section className="py-20 px-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-primary/70 font-semibold mb-3">Guidelines</p>
          <h2 className="font-serif text-4xl font-bold text-foreground">Event Rules</h2>
        </motion.div>
        <div className="space-y-4">
          {rules.map((rule, i) => (
            <motion.div
              key={i}
              custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="flex gap-4 items-start rounded-xl border border-border bg-card px-5 py-4"
              data-testid={`rule-item-${i}`}
            >
              <span className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">{rule}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── VENUE ─── */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="rounded-3xl border border-secondary/20 bg-card p-10 sm:p-14 text-center"
          data-testid="venue-section"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-secondary/80 font-semibold mb-4">Venue & Timing</p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-10">Mark Your Calendar</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-16">
            <div className="flex flex-col items-center gap-2">
              <Clock size={24} className="text-secondary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Date & Time</span>
              <span className="font-semibold text-foreground">31st May 2026</span>
              <span className="text-muted-foreground text-sm">6:00 PM onwards</span>
            </div>
            <div className="h-px sm:h-16 w-16 sm:w-px bg-border" />
            <div className="flex flex-col items-center gap-2">
              <MapPin size={24} className="text-secondary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Venue</span>
              <span className="font-semibold text-foreground">To Be Announced</span>
              <span className="text-muted-foreground text-sm">Registered attendees will be notified</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-28 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[100px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="relative z-10 max-w-2xl mx-auto"
        >
          <h2 className="font-serif text-5xl sm:text-6xl font-bold text-foreground mb-6 italic" data-testid="final-cta-title">
            Don't miss a note.
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Seats are limited. Register today and secure your place at the most memorable evening of the year.
          </p>
          <Link
            href="/register"
            className="inline-block px-12 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300"
            style={{ boxShadow: "0 0 30px rgba(232,129,58,0.35)" }}
            data-testid="final-cta-button"
          >
            Register Now
          </Link>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-5">
          <img src={autumnLogo} alt="Autumn Leaves Events" className="h-12 w-auto rounded opacity-85" />
          <p className="text-xs text-muted-foreground text-center tracking-wide">
            © 2026 Autumn Leaves Events &nbsp;·&nbsp; We Plan Your Party
          </p>
          <div className="flex gap-5 text-muted-foreground">
            <a href="#" aria-label="Instagram" className="hover:text-primary transition-colors" data-testid="footer-instagram"><Instagram size={18} /></a>
            <a href="#" aria-label="Twitter" className="hover:text-primary transition-colors" data-testid="footer-twitter"><Twitter size={18} /></a>
            <a href="#" aria-label="Facebook" className="hover:text-primary transition-colors" data-testid="footer-facebook"><Facebook size={18} /></a>
          </div>
        </div>
      </footer>
    </main>
  );
}
