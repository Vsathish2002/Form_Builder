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
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import hero from "../assets/heroimg.png";

import { motion } from "framer-motion";

// Motion Variants
const fromBottom = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
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

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: "easeOut" },
  },
});

const hoverMotion = {
  whileHover: { y: -6, scale: 1.03 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring", stiffness: 300, damping: 20 },
};
const hoverLift = {
  whileHover: { y: -4, scale: 1.02 },
  transition: { type: "spring", stiffness: 300, damping: 20 },
};

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-900">
      <Hero user={user} navigate={navigate} />
      <TrustBar />
      <Features />
      <HowItWorks />
      <CTA navigate={navigate} />
    </div>
  );
}

// -------- Hero Section --------
function Hero({ user, navigate }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-blue-100">
      {/* ✨ Background animated lights */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
        style={{
          background:
            "radial-gradient(circle at 25% 30%, rgba(59,130,246,0.12), transparent 70%), radial-gradient(circle at 75% 70%, rgba(14,165,233,0.12), transparent 70%)",
          backgroundSize: "200% 200%",
        }}
      />

      <div className="container mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center relative z-10">
        {/* ---- Left Text Content ---- */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fromLeft(0.1)}
          className="space-y-8"
        >
          {/* Gradient Heading */}
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 drop-shadow-sm">
            Effortless Online Form Builder
          </h1>

          {/* Subtext */}
          <p className="text-gray-600 text-lg md:text-xl max-w-md leading-relaxed">
            Create, share, and analyze surveys, polls, and quizzes in minutes
            with beautiful, responsive forms that work seamlessly across every
            device — all powered by live WebSocket updates.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            {user ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/create")}
                  className="relative px-8 py-3 text-white rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 shadow-lg hover:shadow-2xl transition-all"
                >
                  <span className="relative z-10 font-semibold">
                    Create New Form
                  </span>
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>

                <motion.button
                  whileHover={{ y: -3 }}
                  onClick={() =>
                    navigate(
                      user.role === "admin" ? "/admin/dashboard" : "/my-forms"
                    )
                  }
                  className="px-8 py-3 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 font-medium transition"
                >
                  View My Forms
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/register")}
                  className="relative px-8 py-3 text-white rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 shadow-lg hover:shadow-2xl transition-all"
                >
                  <span className="relative z-10 font-semibold">
                    Get Started Free
                  </span>
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>

                <motion.button
                  whileHover={{ y: -3 }}
                  onClick={() => navigate("/login")}
                  className="px-8 py-3 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 font-medium transition"
                >
                  Login
                </motion.button>
              </>
            )}
          </div>

          {/* 🔹 Live Status Tag */}
          <motion.div
            className="flex items-center gap-2 mt-4 text-sm font-medium text-gray-500"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <span className="h-2 w-2 bg-green-400 rounded-full animate-ping"></span>
            <span>Real-time response syncing via WebSockets</span>
          </motion.div>
        </motion.div>

        {/* ---- Right Image Section ---- */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fromRight(0.2)}
          className="relative flex justify-center"
        >
          {/* Floating Image */}
          <motion.img
            src={hero}
            alt="Form builder illustration"
            className="w-80 h-64 md:w-[30rem] md:h-[22rem] object-contain"
            loading="lazy"
            style={{ filter: "drop-shadow(0 18px 18px rgba(59,130,246,0.35))" }}
            animate={{ y: [0, -10, 0], rotate: [0, 1, -1, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          />

          {/* Glowing gradient behind image */}
          <motion.div
            className="pointer-events-none absolute -inset-12 rounded-[3rem] opacity-40 blur-3xl bg-gradient-to-tr from-blue-400 via-sky-300 to-indigo-300"
            animate={{ opacity: [0.25, 0.5, 0.25] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          />

          {/* Floating highlights */}
          <motion.div
            className="absolute top-8 left-6 bg-gradient-to-r from-blue-500 to-sky-400 text-white text-xs px-3 py-1 rounded-full shadow-lg"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            🚀 Real-time Updates
          </motion.div>
          <motion.div
            className="absolute bottom-8 right-8 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs px-3 py-1 rounded-full shadow-lg"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          >
            ⚡ Live Analytics
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// -------- Trust & Badges Section --------
function TrustBar() {
  const items = [
    {
      icon: ChartBarIcon,
      text: "Real-time responses & analytics",
      gradient: "from-green-400 to-emerald-500",
    },
    {
      icon: BoltIcon,
      text: "Instant updates via WebSockets",
      gradient: "from-yellow-400 to-orange-500",
    },
    {
      icon: CloudArrowUpIcon,
      text: "Export anytime, anywhere",
      gradient: "from-sky-400 to-blue-500",
    },
    {
      icon: ShieldCheckIcon,
      text: "Trusted by creators, teams, and startups",
      gradient: "from-indigo-400 to-purple-500",
    },
  ];

  return (
    <section className="relative py-12 bg-gradient-to-b from-blue-50 to-blue-100 overflow-hidden">
      {/* Animated background blur lights */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        style={{
          background:
            "radial-gradient(circle at 20% 40%, rgba(59,130,246,0.12), transparent 70%), radial-gradient(circle at 80% 60%, rgba(14,165,233,0.12), transparent 70%)",
          backgroundSize: "200% 200%",
        }}
      />

      <div className="container mx-auto px-4 flex flex-wrap justify-center gap-6 relative z-10">
        {items.map((it, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: idx * 0.15 }}
            whileHover={{ y: -6, scale: 1.05 }}
            className="relative flex items-center gap-3 bg-white p-5 rounded-2xl shadow-lg hover:shadow-2xl transition w-72"
          >
            {/* Animated icon with glow */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [1, 0.8, 1] }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: "easeInOut",
                delay: idx * 0.4,
              }}
              className={`p-2 rounded-xl bg-gradient-to-r ${it.gradient} text-white shadow-md`}
            >
              <it.icon className="h-6 w-6" />
            </motion.div>

            {/* Text content */}
            <span className="text-gray-700 font-medium text-sm leading-snug">
              {it.text}
            </span>

            {/* Animated glow ring behind each card */}
            <motion.div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${it.gradient} opacity-20 blur-xl -z-10`}
              animate={{ opacity: [0.15, 0.35, 0.15] }}
              transition={{ repeat: Infinity, duration: 4, delay: idx * 0.3 }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// -------- Features Section --------
function Features() {
  const items = [
    {
      Icon: LinkIcon,
      title: "Share by Link",
      desc: "Distribute forms instantly with unique shareable links.",
    },
    {
      Icon: QrCodeIcon,
      title: "QR Code Sharing",
      desc: "Generate QR codes for fast mobile access.",
    },
    {
      Icon: GlobeAltIcon,
      title: "Works Everywhere",
      desc: "Fully responsive on phones, tablets, and desktops.",
    },
    {
      Icon: LockClosedIcon,
      title: "Secure & Private",
      desc: "Protected with modern auth and encryption.",
    },
    {
      Icon: BoltIcon,
      title: "Instant Updates",
      desc: "See responses appear live as users submit forms.",
    }, // ⚡ NEW FEATURE
    {
      Icon: ChartBarIcon,
      title: "Real-time Analytics",
      desc: "Track responses, completion rates, and trends.",
    },
    {
      Icon: BoltIcon,
      title: "Drag & Drop Builder",
      desc: "Build with blocks, reorder fields, and reuse.",
    },
    {
      Icon: SparklesIcon,
      title: "Smart Inputs",
      desc: "Validation, logic jumps, and required rules.",
    },
  ];

  return (
    <section id="features" className="py-14">
      <div className="container mx-auto px-4">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fromBottom(0)}
          className="text-3xl font-extrabold text-blue-700 text-center mb-12"
        >
          Features
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((it, idx) => (
            <motion.div
              key={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={
                idx % 2 === 0 ? fromLeft(idx * 0.2) : fromRight(idx * 0.2)
              }
              className="flex flex-col items-center p-6 bg-white rounded-2xl shadow hover:shadow-xl transition"
              {...hoverLift}
            >
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
    {
      n: "1",
      title: "Build",
      desc: "Design your custom form effortlessly with our drag-and-drop builder and smart input controls.",
      color: "from-blue-500 to-sky-400",
      icon: GlobeAltIcon,
    },
    {
      n: "2",
      title: "Share",
      desc: "Copy your unique link or QR code and share instantly across web, email, or social platforms.",
      color: "from-indigo-500 to-purple-500",
      icon: LinkIcon,
    },
    {
      n: "3",
      title: "Collect",
      desc: "Watch live responses appear instantly and explore real-time analytics — no page refresh needed.",
      color: "from-green-500 to-emerald-400",
      icon: ChartBarIcon,
    },
  ];

  return (
    <section className="relative py-20 bg-gradient-to-b from-blue-50 via-white to-blue-100 overflow-hidden">
      {/* Soft animated background lights */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
        style={{
          background:
            "radial-gradient(circle at 20% 40%, rgba(59,130,246,0.08), transparent 70%), radial-gradient(circle at 80% 60%, rgba(99,102,241,0.08), transparent 70%)",
          backgroundSize: "200% 200%",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Title */}
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fromBottom(0)}
          className="text-4xl font-extrabold text-blue-700 text-center mb-16"
        >
          How It Works
        </motion.h2>

        {/* Steps Grid */}
        <div className="relative grid sm:grid-cols-3 gap-10">
          {/* Connecting line between steps */}
          <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 via-sky-400 to-blue-300 transform -translate-y-1/2 rounded-full" />

          {steps.map((s, idx) => {
            const variant =
              idx === 0
                ? fromLeft(idx * 0.2)
                : idx === 1
                ? fromBottom(idx * 0.2)
                : fromRight(idx * 0.2);

            return (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={variant}
                whileHover={{ y: -8, scale: 1.04 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="relative flex flex-col items-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                {/* Floating Glow */}
                <motion.div
                  className={`absolute -inset-2 rounded-2xl bg-gradient-to-r ${s.color} opacity-20 blur-2xl -z-10`}
                  animate={{ opacity: [0.15, 0.35, 0.15] }}
                  transition={{
                    repeat: Infinity,
                    duration: 4,
                    delay: idx * 0.3,
                  }}
                />

                {/* Step Circle with Icon */}
                <div
                  className={`relative flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r ${s.color} shadow-lg mb-5`}
                >
                  <s.icon className="h-7 w-7 text-white" />
                  {/* Floating number badge */}
                  <motion.div
                    className="absolute -top-3 -right-3 bg-white text-blue-600 h-6 w-6 rounded-full flex items-center justify-center font-bold text-sm shadow"
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                      ease: "easeInOut",
                      delay: idx * 0.5,
                    }}
                  >
                    {s.n}
                  </motion.div>
                </div>

                {/* Title */}
                <h4 className="text-lg font-bold text-blue-700">{s.title}</h4>

                {/* Description */}
                <p className="text-gray-600 mt-3 text-center leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// -------- Call To Action --------
function CTA({ navigate }) {
  const { user } = useAuth(); // ✅ Get current user state

  const handleCTA = () => {
    if (!user) {
      navigate("/register"); // not logged in → go to register
    } else if (user.role === "admin") {
      navigate("/admin/dashboard"); // admin → dashboard
    } else {
      navigate("/my-forms"); // normal user → my forms
    }
  };

  return (
    <section className="relative w-full py-16 mt-8 overflow-hidden bg-gradient-to-r from-blue-600 via-sky-500 to-blue-700">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_60%)]"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />
      <div className="container mx-auto text-center text-white space-y-4 px-4 relative z-10">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp(0)}
          className="text-4xl md:text-5xl font-extrabold"
        >
          Start Creating Forms Today
        </motion.h2>
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp(0.2)}
          className="text-lg md:text-xl"
        >
          Simple, fast, and modern.
        </motion.p>
        <motion.button
          onClick={handleCTA}
          {...hoverMotion}
          className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100"
        >
          {user ? "Go to My Forms" : "Get Started"}
        </motion.button>
      </div>
    </section>
  );
}
