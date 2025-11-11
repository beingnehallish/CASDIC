import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import "../styles/LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  const rootRef = useRef(null);
  const radarRef = useRef(null);
  const themeRef = useRef(null);

  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return (
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
    );
  });

  // ==== THEME (apply to .clp-root, not <html>)
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    el.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // ==== SCROLL PROGRESS BAR
  useEffect(() => {
    const bar = document.querySelector(".clp-scrollbar");
    const onScroll = () => {
      const h = document.documentElement;
      const progress = (h.scrollTop || 0) / Math.max(1, h.scrollHeight - h.clientHeight);
      if (bar) bar.style.setProperty("--clp-progress", String(progress));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ==== GSAP: register
  useEffect(() => {
    if (!gsap.core.globals()["ScrollTrigger"]) gsap.registerPlugin(ScrollTrigger);
  }, []);

  // ==== GSAP PARALLAX & 3D SMOOTH SCROLL
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background parallax
      gsap.to(".clp-bg-grid", {
        y: -150,
        ease: "none",
        scrollTrigger: { scrub: true, start: "top top", end: () => document.body.scrollHeight },
      });
      gsap.to(".clp-glow-a", {
        y: -250,
        scale: 1.05,
        ease: "none",
        scrollTrigger: { scrub: true, start: "top top", end: "max" },
      });
      gsap.to(".clp-glow-b", {
        y: -200,
        scale: 1.03,
        ease: "none",
        scrollTrigger: { scrub: true, start: "top top", end: "max" },
      });

      // Hero radar subtle parallax on scroll
      if (radarRef.current) {
        gsap.to(radarRef.current, {
          yPercent: -10,
          rotate: 0.5,
          scrollTrigger: { trigger: ".clp-hero", start: "top top", end: "bottom top", scrub: true },
        });
      }

      // 3D smooth scroll effect for feature cards and tiles (depth illusion)
      const depthItems = gsap.utils.toArray([".clp-card", ".clp-tile"]);
      depthItems.forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 30, z: 0 },
          {
            y: 0,
            z: -i * 5,
            transformPerspective: 800,
            ease: "power1.out",
            scrollTrigger: { trigger: el, start: "top 80%", end: "top 30%", scrub: true },
          }
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // ==== Button ripple
  const ripple = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--clp-rx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--clp-ry", `${e.clientY - rect.top}px`);
    el.classList.remove("clp-rippling");
    void el.offsetWidth;
    el.classList.add("clp-rippling");
  };

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // ==== Framer Motion variants
  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.65, 0.3, 1] } },
  };
  const stagger = { show: { transition: { staggerChildren: 0.08 } } };

  return (
    <div ref={rootRef} className="clp-root">
      <div className="clp-scrollbar" aria-hidden="true" />

      {/* Background */}
      <div className="clp-bg-grid" aria-hidden="true" />
      <div className="clp-bg-glow clp-glow-a" aria-hidden="true" />
      <div className="clp-bg-glow clp-glow-b" aria-hidden="true" />

      {/* Navbar */}
      <header className="clp-navbar" role="banner">
        <div className="clp-nav-inner">
          <div
            className="clp-brand"
            onClick={() => navigate("/")}
            role="link"
            tabIndex={0}
            aria-label="CASDIC Home"
            onKeyDown={(e) => e.key === "Enter" && navigate("/")}
          >
            <span className="clp-brand-mark">⚛</span>
            <span className="clp-brand-text">CASDIC · DRDO</span>
          </div>

          <nav className="clp-navlinks" aria-label="Primary">
            <button className="clp-navlink" onClick={() => navigate("/")}>Home</button>
            <button className="clp-navlink" onClick={() => navigate("/login")}>User / Employee Login</button>
            <button className="clp-cta" onClick={() => navigate("/register")}>User Registration</button>
            <button className="clp-iconbtn" aria-label="Toggle theme" onClick={toggleTheme} title="Toggle theme">
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero (fullscreen) */}
      <section className="clp-hero" id="clp-main" role="region" aria-label="Hero">
        <div className="clp-hero-grid">
          <motion.div
            className="clp-hero-copy"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h1 className="clp-hero-title">
              <span className="clp-gradient">CASDIC</span> — DRDO Technology Showcase
            </h1>
            <p className="clp-hero-sub">
              Explore cutting-edge electronic warfare & mission avionics innovations crafted to secure the skies and empower India’s defence capabilities.
            </p>
            <div className="clp-hero-actions">
              <button className="clp-btn clp-btn-primary" onMouseDown={ripple} onClick={() => navigate("/login")}>
                Login
                <span className="clp-ripple" aria-hidden="true" />
              </button>
              <button className="clp-btn clp-btn-ghost" onMouseDown={ripple} onClick={() => navigate("/register")}>
                User Registration
                <span className="clp-ripple" aria-hidden="true" />
              </button>
            </div>
            <ul className="clp-hero-list" aria-label="Highlights">
              <li>Curated tech catalogue</li>
              <li>Interest tracking & updates</li>
              <li>Secure, role-based access</li>
            </ul>
          </motion.div>

          <motion.div
            className="clp-hero-art"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <svg
              ref={radarRef}
              className="clp-radar"
              viewBox="0 0 512 512"
              role="img"
              aria-label="Radar vector illustration"
            >
              <defs>
                <radialGradient id="clp-g" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="rgba(0,255,170,0.9)" />
                  <stop offset="60%" stopColor="rgba(0,255,170,0.25)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                </radialGradient>
              </defs>
              <circle cx="256" cy="256" r="200" fill="url(#clp-g)" />
              <circle cx="256" cy="256" r="160" className="clp-ring" />
              <circle cx="256" cy="256" r="120" className="clp-ring" />
              <circle cx="256" cy="256" r="80" className="clp-ring" />
              <line x1="256" y1="256" x2="430" y2="256" className="clp-sweep" />
              <g className="clp-pings">
                <circle cx="340" cy="210" r="6" className="clp-ping" />
                <circle cx="180" cy="310" r="8" className="clp-ping" />
                <circle cx="300" cy="330" r="5" className="clp-ping" />
              </g>
            </svg>
          </motion.div>
        </div>

        <motion.div
          className="clp-hero-stats"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {[{
            num: "30+",
            label: "Years of EW expertise",
          }, { num: "100+", label: "Technologies showcased" }, { num: "24×7", label: "Secure access" }].map((s, i) => (
            <motion.div key={i} className="clp-stat" variants={fadeUp}>
              <span className="clp-stat-num">{s.num}</span><br></br>
              <span className="clp-stat-label">{s.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* About */}
      <motion.section className="clp-about" aria-label="About CASDIC" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        <h2 className="clp-h2">About Us</h2>
        <p className="clp-p">
          The Combat Aircraft Systems Development & Integration Centre (CASDIC) is a specialized laboratory under the Defence Research and Development Organisation (DRDO), India’s apex defense R&D agency. Established in 1986 and headquartered in Bangalore, Karnataka, CASDIC is one of the two DRDO labs dedicated to airborne electronic warfare (EW) and mission avionics systems.
        </p>
        <p className="clp-p">
          Originally founded as the Advanced Systems Integration and Evaluation Organisation (ASIEO), it evolved into the Defence Avionics Research Establishment (DARE) before being restructured as CASDIC in 2021, now operating under the administrative control of Defence Electronics Research Laboratory (DLRL), Hyderabad.
        </p>
      </motion.section>

      {/* Features */}
      <section className="clp-features" aria-label="Platform Highlights">
        <h2 className="clp-h2">Platform Highlights</h2>
        <div className="clp-grid">
          {[
            {
              t: "Explore Technologies",
              p: "Browse active and legacy DRDO technologies in one unified catalogue with rich filters.",
            },
            {
              t: "Show Your Interest",
              p: "Follow technologies you care about and receive updates on advancements and opportunities.",
            },
            {
              t: "Secure Access",
              p: "Role-based authentication ensures data privacy and proper access control across user tiers.",
            },
          ].map((c, i) => (
            <motion.article key={i} className="clp-card" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
              <h3 className="clp-h3">{c.t}</h3>
              <p className="clp-p">{c.p}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Showcase */}
      <section className="clp-showcase" aria-label="Showcase">
        <h2 className="clp-h2">Flagship Programs</h2>
        <div className="clp-grid clp-showcase-grid">
          {["Mission Avionics", "Electronic Warfare", "Simulation & Test"].map((t, i) => (
            <motion.article key={i} className="clp-tile" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
              <h3 className="clp-h3">{t}</h3>
              <p className="clp-p">
                {i === 0 && "Integrated mission computers, navigation suites, and secure comms."}
                {i === 1 && "Advanced ELINT/ECM systems with onboard AI-assisted threat analysis."}
                {i === 2 && "HIL/SIL testbeds and high-fidelity digital twins for rapid iteration."}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Callout */}
      <motion.section className="clp-callout" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        <div className="clp-callout-inner">
          <h2 className="clp-h2">Ready to explore?</h2>
          <p className="clp-p">Create your account to discover, track and collaborate on defence technologies.</p>
          <div className="clp-hero-actions">
            <button className="clp-btn clp-btn-primary" onMouseDown={ripple} onClick={() => navigate("/register")}>
              Get Started
              <span className="clp-ripple" aria-hidden="true" />
            </button>
            <button className="clp-btn clp-btn-ghost" onMouseDown={ripple} onClick={() => navigate("/login")}>
              I already have an account
              <span className="clp-ripple" aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="clp-footer" role="contentinfo">
        <div className="clp-footer-inner">
          <p>© {new Date().getFullYear()} CASDIC · DRDO — All rights reserved.</p>
          <nav aria-label="Footer">
            <a href="#" className="clp-footlink">Privacy</a>
            <a href="#" className="clp-footlink">Terms</a>
            <a href="#" className="clp-footlink">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
