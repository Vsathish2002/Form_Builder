import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  QrCodeIcon,
  LinkIcon,
  GlobeAltIcon,
  LockClosedIcon,
  UserGroupIcon,
  ChartBarIcon,
  BoltIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ClockIcon,
  DocumentCheckIcon,
  UsersIcon,
  CloudArrowUpIcon
} from "@heroicons/react/24/outline";
import hero from "../assets/heroimg.png";

import { motion } from "framer-motion";

// Motion Variants
const fromBottom = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay } },
});
const fromTop = (delay = 0) => ({
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay } },
});
const fromLeft = (delay = 0) => ({
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, delay } },
});
const fromRight = (delay = 0) => ({
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, delay } },
});

const hoverLift = { whileHover: { y: -4, scale: 1.02 }, transition: { type: "spring", stiffness: 300, damping: 20 } };

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-900">
      <Hero user={user} navigate={navigate} />
      <TrustBar />
      <Features />
      <HowItWorks />
      <Templates />
      <AnalyticsPreview />
      <Testimonials />
      <CTA navigate={navigate} />
    </div>
  );
}

// -------- Hero Section --------
function Hero({ user, navigate }) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(59,130,246,0.18),transparent_60%)]" />
      <div className="container mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fromLeft(0.1)} className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-blue-700">
            Effortless Online Form Builder
          </h1>
          <p className="text-gray-600 text-lg md:text-xl">
            Create, share, and analyze surveys, polls, and quizzes in minutes with beautiful, responsive forms that work on every device.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {user ? (
              <>
                <button onClick={() => navigate("/create")} className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700">
                  Create New Form
                </button>
                <button
                  onClick={() => navigate(user.role === "admin" ? "/admin/dashboard" : "/my-forms")}
                  className="px-6 py-3 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50"
                >
                  View My Forms
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate("/register")} className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700">
                  Get Started Free
                </button>
                <button onClick={() => navigate("/login")} className="px-6 py-3 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50">
                  Login
                </button>
              </>
            )}
          </div>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fromRight(0.2)} className="relative flex justify-center">
          <img src={hero} alt="Form builder illustration" className="w-80 h-64 md:w-[28rem] md:h-[22rem] object-contain" loading="lazy" style={{ filter: "drop-shadow(0 18px 18px rgba(59,130,246,0.35))" }} />
          <div className="pointer-events-none absolute -inset-8 rounded-[2rem] opacity-30 blur-2xl bg-gradient-to-tr from-blue-400 to-sky-300" />
        </motion.div>
      </div>
    </section>
  );
}

// -------- Trust & Badges Section --------
function TrustBar() {
  const items = [
    { icon: ShieldCheckIcon, text: "Trusted by creators, teams, and startups" },
    { icon: ClockIcon, text: "99.99% uptime" },
    { icon: UsersIcon, text: "GDPR-ready" },
    { icon: CloudArrowUpIcon, text: "Export anytime" },
  ];

  return (
    <section className="py-10 bg-blue-100">
      <div className="container mx-auto px-4 flex flex-wrap justify-center gap-6">
        {items.map((it, idx) => (
          <motion.div key={idx} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fromBottom(idx * 0.2)} className="flex items-center gap-3 bg-white p-4 rounded-xl shadow hover:shadow-lg transition w-64">
            <it.icon className="h-6 w-6 text-blue-600" />
            <span className="text-gray-700 font-medium text-sm">{it.text}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// -------- Features Section --------
function Features() {
  const items = [
    { Icon: LinkIcon, title: "Share by Link", desc: "Distribute forms instantly with unique shareable links." },
    { Icon: QrCodeIcon, title: "QR Code Sharing", desc: "Generate QR codes for fast mobile access." },
    { Icon: GlobeAltIcon, title: "Works Everywhere", desc: "Fully responsive on phones, tablets, and desktops." },
    { Icon: LockClosedIcon, title: "Secure & Private", desc: "Protected with modern auth and encryption." },
    { Icon: UserGroupIcon, title: "Team Collaboration", desc: "Invite teammates with role-based access." },
    { Icon: ChartBarIcon, title: "Real-time Analytics", desc: "Track responses, completion rates, and trends." },
    { Icon: BoltIcon, title: "Drag & Drop Builder", desc: "Build with blocks, reorder fields, and reuse." },
    { Icon: SparklesIcon, title: "Smart Inputs", desc: "Validation, logic jumps, and required rules." },
  ];

  return (
    <section id="features" className="py-14">
      <div className="container mx-auto px-4">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fromBottom(0)} className="text-3xl font-extrabold text-blue-700 text-center mb-12">
          Features
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((it, idx) => (
            <motion.div key={idx} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={idx % 2 === 0 ? fromLeft(idx*0.2) : fromRight(idx*0.2)} className="flex flex-col items-center p-6 bg-white rounded-2xl shadow hover:shadow-xl transition" {...hoverLift}>
              <it.Icon className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold">{it.title}</h3>
              <p className="text-gray-500 mt-2 text-center">{it.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// -------- How It Works Section --------
function HowItWorks() {
  const steps = [
    { n: "1", title: "Build", desc: "Design your custom form with drag-and-drop ease." },
    { n: "2", title: "Share", desc: "Copy the link or QR code and send to anyone." },
    { n: "3", title: "Collect", desc: "View real-time responses and analyze results." },
  ];

  return (
    <section className="py-14 bg-blue-50">
      <div className="container mx-auto px-4">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fromBottom(0)} className="text-3xl font-extrabold text-blue-700 text-center mb-8">
          How It Works
        </motion.h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map((s, idx) => {
            const variant = idx === 0 ? fromLeft(idx*0.2) : idx === 1 ? fromBottom(idx*0.2) : fromRight(idx*0.2);
            return (
              <motion.div key={idx} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variant} className="flex flex-col items-center bg-white rounded-2xl p-6 shadow hover:shadow-lg transition" {...hoverLift}>
                <div className="h-12 w-12 bg-blue-600 text-white flex items-center justify-center rounded-full font-bold text-lg mb-3">{s.n}</div>
                <h4 className="font-semibold text-blue-700">{s.title}</h4>
                <p className="text-gray-600 mt-2 text-center">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// -------- Templates Section --------
function Templates() {
  const templates = [
    { name: "Job Application", image: "../assets/job.jpg" },
    { name: "Customer Feedback", image: "../assets/customer.png" },
    { name: "Event Registration", image: "../assets/Eventpage.png" },
    { name: "Bug Report", image: "../assets/bug-report-form.png" },
  ];

  return (
    <section id="templates" className="py-14">
      <div className="container mx-auto px-4">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fromBottom(0)}
          className="text-3xl font-extrabold text-blue-700 text-center mb-8"
        >
          Start from Templates
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((t, idx) => (
            <motion.div
              key={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={idx % 2 === 0 ? fromLeft(idx * 0.2) : fromRight(idx * 0.2)}
              className="rounded-xl border border-blue-100 bg-white p-5 hover:shadow-lg transition cursor-pointer"
              {...hoverLift}
            >
              {/* Render template image */}
              <div className="aspect-video rounded-lg overflow-hidden mb-3">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="font-semibold">{t.name}</div>
              <div className="text-sm text-gray-500">Use template</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


// -------- Analytics Section --------
function AnalyticsPreview() {
  const stats = [
    { icon: ChartBarIcon, label: "Completion Rate", value: "95%" },
    { icon: QrCodeIcon, label: "QR Scans", value: "1.2K" },
    { icon: LinkIcon, label: "Shared Links", value: "3.4K" },
    { icon: BoltIcon, label: "Forms Created", value: "870" },
  ];

  return (
    <section className="py-14 bg-white">
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fromLeft(0)} className="space-y-6">
          <h3 className="text-3xl font-bold text-blue-700">Instant Insights</h3>
          <p className="text-gray-600 text-lg">
            Track completions, drop-off by question, device breakdowns, and export ready-to-share charts. Filter by time or team.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {stats.map((s, idx) => (
              <motion.div key={idx} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fromBottom(idx*0.2)} className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl shadow hover:shadow-lg transition">
                <s.icon className="h-6 w-6 text-blue-600" />
                <div>
                  <div className="text-gray-700 font-medium">{s.label}</div>
                  <div className="text-blue-700 font-bold">{s.value}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fromRight(0.2)} className="rounded-2xl bg-gradient-to-tr from-blue-50 to-white h-64 flex items-center justify-center shadow">
          <span className="text-blue-300 font-bold text-3xl">📊 Analytics Preview</span>
        </motion.div>
      </div>
    </section>
  );
}

// -------- Testimonials Section --------
function Testimonials() {
  const quotes = [
    { name: "Aarav, Product Lead", text: "Launched a research survey in under 15 minutes. Response analytics saved hours each week." },
    { name: "Sara, Community Manager", text: "QR sharing at events was flawless—mobile forms looked great and converted better." },
  ];

  return (
    <section className="py-14 bg-blue-50">
      <div className="container mx-auto px-4">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fromBottom(0)} className="text-3xl font-extrabold text-blue-700 text-center mb-8">
          Loved by Teams
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-6">
          {quotes.map((q, idx) => (
            <motion.blockquote key={idx} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={idx % 2 === 0 ? fromLeft(idx*0.2) : fromRight(idx*0.2)} className="p-6 rounded-2xl bg-white shadow">
              <p className="text-gray-700">“{q.text}”</p>
              <footer className="mt-3 text-sm text-gray-500">— {q.name}</footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

// -------- Call To Action --------
function CTA({ navigate }) {
  return (
    <section className="w-full bg-blue-600 py-16 mt-8">
      <div className="container mx-auto text-center text-white space-y-4 px-4">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fromTop(0)} className="text-4xl md:text-5xl font-extrabold">
          Start Creating Forms Today
        </motion.h2>
        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fromBottom(0)} className="text-lg md:text-xl">
          No account needed to try the builder. Simple, fast, and modern.
        </motion.p>
        <motion.button onClick={() => navigate("/register")} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fromBottom(0.2)} className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100">
          Get Started
        </motion.button>
      </div>
    </section>
  );
}
