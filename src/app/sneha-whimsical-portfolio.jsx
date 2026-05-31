import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from "react";
import {
  motion, AnimatePresence,
  useMotionValue, useSpring, useTransform,
} from "framer-motion";

// ─────────────────────────────────────────────
//  THEME TOKENS
// ─────────────────────────────────────────────
const THEMES = {
  light: {
    bg:       "#faf7f2",
    bgAlt:    "#f5f0e8",
    bgCard:   "#faf7f2",
    bgCardHv: "#0e0c0a",
    ink:      "#0e0c0a",
    muted:    "rgba(14,12,10,0.42)",
    border:   "rgba(14,12,10,0.10)",
    navBg:    "rgba(250,247,242,0.85)",
    quoteBlockBg: "#f5f0e8",
  },
  dark: {
    bg:       "#0e0c0a",
    bgAlt:    "#1a1714",
    bgCard:   "#181512",
    bgCardHv: "#faf7f2",
    ink:      "#f5f0e8",
    muted:    "rgba(245,240,232,0.45)",
    border:   "rgba(245,240,232,0.10)",
    navBg:    "rgba(14,12,10,0.85)",
    quoteBlockBg: "#1a1714",
  },
};

const A = {
  accent: "#ff4d1c",
  mint:   "#00c896",
  sky:    "#4da6ff",
  lilac:  "#c084fc",
  gold:   "#f59e0b",
};

const F = {
  display: "'Fraunces', serif",
  sans:    "'Bricolage Grotesque', sans-serif",
  mono:    "'DM Mono', monospace",
};

const EASE_SPRING = { type: "spring", stiffness: 280, damping: 20 };
const EASE_SOFT   = [0.34, 1.56, 0.64, 1];

// ─────────────────────────────────────────────
//  FONT LOADER
// ─────────────────────────────────────────────
function useFonts() {
  useEffect(() => {
    const el = document.createElement("link");
    el.rel  = "stylesheet";
    el.href = "https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,400;1,700&family=Bricolage+Grotesque:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
}

// ─────────────────────────────────────────────
//  INTERSECTION OBSERVER HOOK
// ─────────────────────────────────────────────
function useInViewSimple(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return visible;
}

// ─────────────────────────────────────────────
//  FLOATING CROISSANT
// ─────────────────────────────────────────────
function FloatingCroissant() {
  const mx = useMotionValue(0), my = useMotionValue(0);
  const bx = useSpring(mx, { stiffness: 55, damping: 12 });
  const by = useSpring(my, { stiffness: 55, damping: 12 });
  const rx = useTransform(by, [-300, 300], [20, -20]);
  const ry = useTransform(bx, [-300, 300], [-20, 20]);

  useEffect(() => {
    const update = (e) => {
      mx.set(e.clientX - window.innerWidth / 2);
      my.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener("mousemove", update);
    return () => window.removeEventListener("mousemove", update);
  }, []);

  return (
    <motion.div
      style={{
        x: bx, y: by,
        position: "fixed", top: "50%", left: "50%",
        translateX: "-50%", translateY: "-50%",
        width: 110, height: 110,
        rotateX: rx, rotateY: ry,
        pointerEvents: "none", zIndex: 0,
        perspective: 600,
        fontSize: "5.5rem", lineHeight: 1,
        filter: "drop-shadow(0 20px 40px rgba(255,77,28,0.22))",
        userSelect: "none",
      }}
      animate={{ y: [0, -18, 0], rotate: [-4, 4, -4] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
    >
      🍁
    </motion.div>
  );
}

// ─────────────────────────────────────────────
//  CURTAIN TRANSITION
// ─────────────────────────────────────────────
function CurtainTransition({ isAnimating }) {
  return (
    <AnimatePresence>
      {isAnimating && (
        <>
          <motion.div key="c1"
            initial={{ scaleY: 0, originY: 0 }} animate={{ scaleY: 1 }}
            exit={{ scaleY: 0, originY: 1 }}
            transition={{ duration: 0.38, ease: [0.76, 0, 0.24, 1] }}
            style={{ position: "fixed", inset: 0, background: A.accent, zIndex: 9000, transformOrigin: "top" }}
          />
          <motion.div key="c2"
            initial={{ scaleY: 0, originY: 0 }} animate={{ scaleY: 1 }}
            exit={{ scaleY: 0, originY: 1 }}
            transition={{ duration: 0.38, ease: [0.76, 0, 0.24, 1], delay: 0.05 }}
            style={{ position: "fixed", inset: 0, background: "#0e0c0a", zIndex: 9001, transformOrigin: "top" }}
          />
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
//  THEME TOGGLE BUTTON
// ─────────────────────────────────────────────
function ThemeToggle({ dark, onToggle }) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.1, rotate: 15 }}
      whileTap={{ scale: 0.88, rotate: -10 }}
      transition={EASE_SPRING}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        width: 38, height: 38, borderRadius: "50%",
        border: `1.5px solid ${dark ? "rgba(245,240,232,0.18)" : "rgba(14,12,10,0.12)"}`,
        background: dark ? "rgba(245,240,232,0.08)" : "rgba(14,12,10,0.06)",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.1rem",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={dark ? "moon" : "sun"}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ duration: 0.2 }}
        >
          {dark ? "☀️" : "🌙"}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

// ─────────────────────────────────────────────
//  NAVBAR
// ─────────────────────────────────────────────
function Navbar({ dark, onToggleDark, th }) {
  const [activeId, setActiveId] = useState("hero");

  const sections = [
    ["Work",    "projects"],
    ["About",   "about"],
    ["Contact", "contact"],
  ];

  const scrollTo = (id) => {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // Highlight active section on scroll
  useEffect(() => {
    const ids = ["hero", "projects", "about", "contact"];
    const handler = () => {
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top <= 80) {
          setActiveId(ids[i]);
          break;
        }
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
      background: th.navBg,
      borderBottom: `1px solid ${th.border}`,
    }}>
      <nav style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 2rem",
        height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <motion.button
          onClick={() => scrollTo("hero")}
          whileHover={{ rotate: -5, scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          style={{ fontFamily: F.display, fontSize: "1.4rem", fontWeight: 900, color: th.ink, background: "none", border: "none", cursor: "pointer", letterSpacing: "-0.03em" }}
        >
          SC<span style={{ color: A.accent }}>.</span>
        </motion.button>

        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {sections.map(([label, id]) => (
            <motion.button key={id}
              onClick={() => scrollTo(id)}
              whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }}
              style={{
                fontFamily: F.sans, fontSize: "0.82rem", fontWeight: 600,
                background: "none", border: "none", cursor: "pointer",
                color: activeId === id ? A.accent : th.muted,
                transition: "color 0.2s",
                position: "relative", padding: "4px 0",
              }}
            >
              {label}
              {activeId === id && (
                <motion.div layoutId="nav-dot"
                  style={{ position: "absolute", bottom: -2, left: "50%", translateX: "-50%", width: 4, height: 4, borderRadius: "50%", background: A.accent }}
                />
              )}
            </motion.button>
          ))}

          <ThemeToggle dark={dark} onToggle={onToggleDark} />

          <motion.a href="#"
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.88, rotate: -3 }}
            style={{
              fontFamily: F.sans, fontSize: "0.78rem", fontWeight: 700,
              padding: "0.45rem 1.1rem", borderRadius: 999,
              background: th.ink, color: th.bg, border: "none", cursor: "pointer",
              textDecoration: "none", display: "inline-block",
            }}
          >
            ↓ Resume
          </motion.a>
        </div>
      </nav>
    </header>
  );
}

// ─────────────────────────────────────────────
//  TILT CARD
// ─────────────────────────────────────────────
function TiltCard({ children, accent = A.accent }) {
  const ref  = useRef(null);
  const rotX = useMotionValue(0), rotY = useMotionValue(0);
  const sX   = useSpring(rotX, { stiffness: 200, damping: 22 });
  const sY   = useSpring(rotY, { stiffness: 200, damping: 22 });
  const glow = useTransform(sY, [-15, 15], [`${accent}00`, `${accent}28`]);

  const onMove = useCallback((e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    rotY.set(((e.clientX - r.left) / r.width  - 0.5) * 18);
    rotX.set(-((e.clientY - r.top)  / r.height - 0.5) * 12);
  }, []);

  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={() => { rotX.set(0); rotY.set(0); }}
      style={{ rotateX: sX, rotateY: sY, perspective: 800, borderRadius: 20, position: "relative", height: "100%" }}
    >
      <motion.div style={{ background: glow, borderRadius: 20, position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }} />
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
//  SECTION LABEL
// ─────────────────────────────────────────────
function SectionLabel({ num, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "1.5rem" }}>
      <span style={{ fontFamily: F.mono, fontSize: "0.7rem", color: A.accent }}>{num}</span>
      <div style={{ width: 40, height: 1, background: A.accent }} />
      <span style={{ fontFamily: F.mono, fontSize: "0.7rem", color: "rgba(128,128,128,0.7)" }}>{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
//  PROJECTS
// ─────────────────────────────────────────────
const PROJECTS = [
  {
    num: "01", accent: A.accent,
    title: "SmartSplit",
    image: "/assets/smartsplit.png",
    tagline: "Split Smart. Pay Easy.",
    peek: "Warning: May contain trending payment memes 💸",
    desc: "An AI-assisted group expense web app featuring smart categorization, a mock UPI PayNow system, and fun meme-based payment reminders inside a Galactic-themed UI.",
    tags: ["React 19", "Tailwind CSS", "Framer Motion", "Shadcn UI"],
    liveUrl: "https://smartsplit-zgm8-2hve8nghu-ansh-10-ps-projects.vercel.app",
  },
  {
    num: "02", accent: A.mint,
    title: "Festo",
    image: "/assets/campus.png",
    tagline: "Managing campus chaos, one registration at a time.",
    peek: "3 000+ students survived. Mostly.",
    desc: "Full-stack platform: QR check-ins, real-time capacity tracking, automated emails. Spreadsheets never stood a chance.",
    tags: ["Next.js", "MongoDB", "Tailwind", "Auth.js"],
    liveUrl: "https://campus-event-system-main-phi.vercel.app/",
  },
  {
    num: "03", accent: A.sky,
    title: "Neuroscan AI",
    image: "/assets/neuroscan.png",
    tagline: "Data-driven framework for early disease detection.",
    peek: "Turning MRI scans into actionable insights.",
    desc: "Deep learning system classifying Alzheimer's stages from MRI images. Features class-imbalance handling and a Streamlit dashboard.",
    tags: ["Python", "ResNet-18", "Streamlit", "Deep Learning"],
    liveUrl: "https://alzheimer-disease-detection-using-d.vercel.app/",
  },
];

function ProjectCard({ p, index, th, dark }) {
  const [hovered, setHovered] = useState(false);
  const ref    = useRef(null);
  const inView = useInViewSimple(ref);

  // light mode hover → card goes dark → text goes white
  // dark mode hover  → card goes light cream → text goes dark ink
  const cardBg   = hovered ? th.bgCardHv : th.bgCard;
  const textMain = hovered ? (th === THEMES.light ? "#fff" : "#0e0c0a") : th.ink; 
  const textSub  = hovered ? (th === THEMES.light ? "rgba(255,255,255,0.5)" : "rgba(14,12,10,0.5)") : th.muted;
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 56 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.12, duration: 0.6, ease: EASE_SOFT }}
      style={{ height: "100%" }}
    >
      <TiltCard accent={p.accent}>
        <motion.article
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          onClick={() => p.liveUrl && window.open(p.liveUrl, "_blank")}
          style={{
            background: cardBg,
            border: `2px solid ${hovered ? p.accent : th.border}`,
            borderRadius: 20, overflow: "hidden",
            transition: "background 0.3s, border-color 0.3s",
            cursor: p.liveUrl ? "pointer" : "default",
            display: "flex", flexDirection: "column", height: "100%",
          }}
        >
          {/* Preview band */}
          <div style={{
            height: 220, position: "relative", overflow: "hidden",
            background: `linear-gradient(135deg, ${p.accent}18 0%, ${p.accent}06 100%)`,
            borderBottom: `2px solid ${hovered ? p.accent : th.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "border-color 0.3s",
          }}>
            {/* Grid decoration (only shows when no image, or faintly behind image) */}
            <div style={{ position: "absolute", inset: 0, opacity: p.image ? (hovered ? 0 : 0) : (hovered ? 0.12 : 0.05), backgroundImage: `linear-gradient(${p.accent} 1px, transparent 1px), linear-gradient(90deg, ${p.accent} 1px, transparent 1px)`, backgroundSize: "32px 32px", transition: "opacity 0.3s", zIndex: 0 }} />

            {/* Number watermark — only visible when no image */}
            {!p.image && <span style={{ position: "absolute", bottom: -14, right: 14, fontFamily: F.display, fontSize: "7rem", lineHeight: 1, color: `${p.accent}${hovered ? "20" : "0e"}`, userSelect: "none", transition: "color 0.3s", zIndex: 0 }}>{p.num}</span>}

            {p.image ? (
              /* ── Full-bleed image ── */
              <motion.img
                src={p.image}
                alt={p.title}
                animate={{ scale: hovered ? 1.06 : 1 }}
                transition={{ type: "spring", stiffness: 180, damping: 22 }}
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%",
                  objectFit: "cover", objectPosition: "top",
                  zIndex: 1,
                }}
              />
            ) : (
              /* ── Emoji fallback ── */
              <motion.span
                animate={{ rotate: hovered ? [0, -10, 10, -6, 6, 0] : 0, scale: hovered ? 1.25 : 1 }}
                transition={{ duration: 0.5 }}
                style={{ fontSize: "3.5rem", zIndex: 2 }}
              >{p.emoji}</motion.span>
            )}

            {/* Gradient overlay so peek tooltip is readable over images */}
            {p.image && (
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, rgba(0,0,0,0.32) 0%, transparent 50%)`, zIndex: 2, pointerEvents: "none" }} />
            )}

            {/* Playful Peek tooltip */}
            <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.9 }} transition={EASE_SPRING}
                  style={{ position: "absolute", top: 12, left: "50%", translateX: "-50%", background: p.accent, color: "#fff", fontFamily: F.mono, fontSize: "0.68rem", fontWeight: 500, padding: "0.3rem 0.9rem", borderRadius: 999, whiteSpace: "nowrap", zIndex: 10 }}
                >{p.peek}</motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Body */}
          <div style={{ padding: "1.6rem", display: "flex", flexDirection: "column", flex: 1 }}>
            <p style={{ fontFamily: F.mono, fontSize: "0.68rem", color: p.accent, marginBottom: "0.3rem" }}>{p.num} ·</p>
            <h3 style={{ fontFamily: F.display, fontSize: "1.45rem", fontWeight: 900, color: textMain, marginBottom: "0.3rem", transition: "color 0.3s" }}>{p.title}</h3>
            <p style={{ fontFamily: F.sans, fontSize: "0.78rem", color: textSub, fontStyle: "italic", marginBottom: "0.8rem", transition: "color 0.3s" }}>"{p.tagline}"</p>
            <p style={{ fontFamily: F.sans, fontSize: "0.8rem", color: textSub, lineHeight: 1.75, marginBottom: "1.2rem", transition: "color 0.3s", flex: 1 }}>{p.desc}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: "1.2rem" }}>
              {p.tags.map(t => (
                <span key={t} style={{ fontFamily: F.mono, fontSize: "0.65rem", padding: "0.2rem 0.6rem", borderRadius: 999, border: `1px solid ${p.accent}50`, color: p.accent, background: `${p.accent}10` }}>{t}</span>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.88, rotate: -2 }} transition={EASE_SPRING}
              onClick={(e) => { e.stopPropagation(); p.liveUrl && window.open(p.liveUrl, "_blank"); }}
              style={{ fontFamily: F.sans, fontSize: "0.78rem", fontWeight: 700, padding: "0.55rem 1.3rem", borderRadius: 999, background: p.accent, color: "#fff", border: "none", cursor: "pointer", alignSelf: "flex-start", marginTop: "auto" }}
            >
              {p.liveUrl ? "View Live ↗" : "Case Study ↗"}
            </motion.button>
          </div>
        </motion.article>
      </TiltCard>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
//  STICKER
// ─────────────────────────────────────────────
function Sticker({ emoji, label, sub, color, rotation = 0, delay = 0, th }) {
  const ref = useRef(null);
  const vis = useInViewSimple(ref);
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, scale: 0.5, rotate: rotation - 15 }}
      animate={vis ? { opacity: 1, scale: 1, rotate: rotation } : {}}
      transition={{ delay, type: "spring", stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.12, rotate: rotation + 5, transition: EASE_SPRING }}
      whileTap={{ scale: 0.9 }}
      style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "1rem 1.4rem", borderRadius: 18, background: color + "18", border: `2.5px solid ${color}40`, cursor: "default" }}
    >
      <span style={{ fontSize: "2.2rem" }}>{emoji}</span>
      <span style={{ fontFamily: F.sans, fontSize: "0.8rem", fontWeight: 700, color: th.ink }}>{label}</span>
      <span style={{ fontFamily: F.mono, fontSize: "0.65rem", color: th.muted }}>{sub}</span>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
//  SKILL CHIP
// ─────────────────────────────────────────────
function SkillChip({ label, color, delay }) {
  return (
    <motion.div drag dragConstraints={{ left: -20, right: 20, top: -10, bottom: 10 }} dragElastic={0.3}
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay, type: "spring", stiffness: 280, damping: 18 }}
      whileHover={{ scale: 1.1, rotate: [0, -3, 3, 0], transition: { duration: 0.3 } }}
      whileDrag={{ scale: 1.18, zIndex: 50 }}
      style={{ cursor: "grab", userSelect: "none", display: "inline-block" }}
    >
      <span style={{ fontFamily: F.mono, fontSize: "0.8rem", fontWeight: 500, padding: "0.38rem 1rem", borderRadius: 999, border: `1.5px solid ${color}50`, color, background: `${color}10`, display: "inline-block" }}>
        {label}
      </span>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
//  CONFETTI
// ─────────────────────────────────────────────
function Confetti({ origin }) {
  const pieces = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    id: i,
    color: [A.accent, A.mint, A.sky, A.lilac, A.gold, "#fff"][i % 6],
    angle: (i / 30) * 360,
    dist: 80 + Math.random() * 110,
    size: 6 + Math.random() * 8,
    shape: Math.random() > 0.5 ? "circle" : "rect",
  })), []);

  return (
    <div style={{ position: "fixed", left: origin.x, top: origin.y, pointerEvents: "none", zIndex: 9999 }}>
      {pieces.map(p => {
        const rad = (p.angle * Math.PI) / 180;
        return (
          <motion.div key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
            animate={{ x: Math.cos(rad) * p.dist, y: Math.sin(rad) * p.dist, opacity: 0, scale: 0, rotate: 360 * (Math.random() > 0.5 ? 1 : -1) }}
            transition={{ duration: 0.9 + Math.random() * 0.4, ease: "easeOut" }}
            style={{ position: "absolute", width: p.size, height: p.size, borderRadius: p.shape === "circle" ? "50%" : 2, background: p.color }}
          />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
//  TIMELINE ITEM
// ─────────────────────────────────────────────
function TimelineItem({ year, role, org, detail, color, i, th }) {
  const ref    = useRef(null);
  const inView = useInViewSimple(ref);
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: i * 0.12, duration: 0.55, ease: EASE_SOFT }}
      style={{ display: "flex", gap: 20, paddingBottom: "2.5rem" }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 12 }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 3 }} />
      </div>
      <div>
        <span style={{ fontFamily: F.mono, fontSize: "0.67rem", color, letterSpacing: "0.08em" }}>{year}</span>
        <h3 style={{ fontFamily: F.display, fontSize: "1.1rem", fontWeight: 700, color: th.ink, margin: "0.2rem 0 0.1rem" }}>{role}</h3>
        <span style={{ fontFamily: F.mono, fontSize: "0.73rem", color: th.muted }}>{org}</span>
        <p style={{ fontFamily: F.sans, fontSize: "0.78rem", color: th.muted, lineHeight: 1.75, marginTop: "0.4rem" }}>{detail}</p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────
const SKILLS = [
  { label: "React.js",               color: A.sky,    delay: 0.05 },
  { label: "TypeScript",             color: A.accent, delay: 0.10 },
  { label: "Figma",                  color: A.lilac,  delay: 0.15 },
  { label: "API Integration",        color: A.mint,   delay: 0.20 },
  { label: "Tailwind CSS",           color: A.sky,    delay: 0.25 },
  { label: "Component Architecture", color: A.accent, delay: 0.30 },
  { label: "Node.js",                color: "#22c55e",delay: 0.35 },
  { label: "UI/UX Design",           color: A.lilac,  delay: 0.40 },
  { label: "Next.js",                color: A.mint,   delay: 0.45 },
  { label: "Python",                 color: A.gold,   delay: 0.50 },
];

const TIMELINE = [
  { year: "JUNE 2024",       role: "Web Development Intern",  org: "In-House Internship",    detail: "Architected and deployed a full-featured e-commerce application with a focus on UX and state management.", color: A.mint  },
  { year: "DEC 2024–2025",   role: "Web Development Intern",  org: "Compozent",              detail: "Intensive training-based internship; mastered advanced frontend patterns and modern web development workflows.", color: A.gold  },
  { year: "JAN 2026–PRESENT",role: "Frontend Developer",      org: "TechStudios · Mumbai",   detail: "Rebuilt design system in React + Tailwind. Cut UI bug reports by 33% and reduced code duplication by 60%.", color: A.sky   },
];

const SOCIAL_LINKS = [
  { label: "GitHub",   sub: "@snehachy12",          href: "https://github.com/snehachy12",         emoji: "⌥", color: "#555" },
  { label: "LinkedIn", sub: "Sneha Choudhary",       href: "https://linkedin.com/in/sneha-choudhary", emoji: "◈", color: A.sky  },
  { label: "Email",    sub: "sneha.p.chy04@gmail.com", href: "copy",                               emoji: "◎", color: A.accent },
];

const EASTER_MSGS = [
  "You clicked it! 🎉", "Again?! Bold move.", "Ok this is getting weird 👀",
  "I respect the commitment.", "...fine. Have more confetti 🎊",
];

// ─────────────────────────────────────────────
//  MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  useFonts();
  const [dark, setDark]     = useState(false);
  const [curtain, setCurtain] = useState(false);
  const [confettis, setConfettis] = useState([]);
  const [eggClicks, setEggClicks] = useState(0);
  const [copied, setCopied] = useState(false);
  const eggRef = useRef(null);

  const th = dark ? THEMES.dark : THEMES.light;

  // smooth dark↔light transition with curtain
  const toggleDark = () => {
    setCurtain(true);
    setTimeout(() => { setDark(d => !d); }, 320);
    setTimeout(() => setCurtain(false), 680);
  };

  const fireConfetti = () => {
    const r = eggRef.current?.getBoundingClientRect();
    if (!r) return;
    const id = Date.now();
    setConfettis(c => [...c, { id, x: r.left + r.width / 2, y: r.top + r.height / 2 }]);
    setEggClicks(n => n + 1);
    setTimeout(() => setConfettis(c => c.filter(x => x.id !== id)), 1600);
  };

  const handleCopy = (e, email) => {
    e.preventDefault();
    navigator.clipboard.writeText(email).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div style={{ background: th.bg, color: th.ink, minHeight: "100vh", overflowX: "hidden", transition: "background 0.5s, color 0.5s" }}>
      <CurtainTransition isAnimating={curtain} />

      {/* ── NAVBAR ── */}
      <Navbar dark={dark} onToggleDark={toggleDark} th={th} />


      {/* ══════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════ */}
      <section id="hero" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 2rem 4rem", maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1, paddingTop: 60 }}>

        {/* Floating croissant (fixed, behind content) */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <FloatingCroissant />
        </div>

        <motion.div
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2rem", position: "relative", zIndex: 2 }}
        >
          <span style={{ fontFamily: F.mono, fontSize: "0.7rem", color: A.accent, padding: "0.3rem 0.9rem", borderRadius: 999, border: `1.5px solid ${A.accent}`, letterSpacing: "0.12em" }}>Open to Work ✦</span>
          <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} style={{ width: 7, height: 7, borderRadius: "50%", background: A.accent, display: "inline-block" }} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: EASE_SOFT }}
          style={{ fontFamily: F.display, fontSize: "clamp(2.8rem, 6.5vw, 6.8rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.02em", color: th.ink, maxWidth: "16ch", marginBottom: "1.5rem", position: "relative", zIndex: 2 }}
        >
          Sneha crafts{" "}
          <em style={{ color: A.accent, fontStyle: "italic" }}>digital magic</em>
          {" "}(and scalable React apps).
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{ fontFamily: F.sans, fontSize: "1rem", color: th.muted, maxWidth: "50ch", lineHeight: 1.85, marginBottom: "2.5rem", position: "relative", zIndex: 2 }}
        >
          Frontend Developer & UI/UX Enthusiast. Computer Engineering student who turns Figma files into pixel-perfect, spring-animated reality.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          style={{ display: "flex", gap: 12, flexWrap: "wrap", position: "relative", zIndex: 2 }}
        >
          {[
            { label: "↓ See My Work", bg: th.ink, fg: th.bg, target: "projects" },
            { label: "Let's Talk 🥐", bg: A.accent, fg: "#fff", target: "contact" },
          ].map(({ label, bg, fg, target }) => (
            <motion.button key={label}
              whileHover={{ scale: 1.06, y: -3 }} whileTap={{ scale: 0.84, rotate: -2 }} transition={EASE_SPRING}
              onClick={() => document.getElementById(target)?.scrollIntoView({ behavior: "smooth" })}
              style={{ fontFamily: F.sans, fontSize: "0.85rem", fontWeight: 700, padding: "0.8rem 2rem", borderRadius: 999, background: bg, color: fg, border: "none", cursor: "pointer" }}
            >{label}</motion.button>
          ))}
        </motion.div>

        {/* Scroll nudge */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          style={{ position: "absolute", bottom: 28, left: "50%", translateX: "-50%", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 2 }}
        >
          <span style={{ fontFamily: F.mono, fontSize: "0.6rem", color: th.muted, letterSpacing: "0.2em" }}>SCROLL</span>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
            style={{ width: 1, height: 30, background: `linear-gradient(to bottom, ${A.accent}, transparent)` }} />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          PROJECTS SECTION
      ══════════════════════════════════════ */}
      <section id="projects" style={{ width: "100%", padding: "6rem 0", background: th.bg, transition: "background 0.5s" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem" }}>
          <SectionLabel num="02" label="selected work" />
          <motion.h2
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE_SOFT }}
            style={{ fontFamily: F.display, fontSize: "clamp(1.8rem, 3.5vw, 3rem)", fontWeight: 900, color: th.ink, marginBottom: "3rem" }}
          >
            Things I've created{" "}
            <em style={{ color: A.accent, fontStyle: "italic" }}>(and survived)</em>
          </motion.h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, alignItems: "stretch" }}>
            {PROJECTS.map((p, i) => <ProjectCard key={p.num} p={p} index={i} th={th} dark={dark} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          ABOUT SECTION
      ══════════════════════════════════════ */}
      <section id="about" style={{ background: th.bgAlt, transition: "background 0.5s" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "6rem 2rem" }}>

          <SectionLabel num="01" label="the human behind the code" />
          <motion.h2
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE_SOFT }}
            style={{ fontFamily: F.display, fontSize: "clamp(2.5rem, 5.5vw, 5rem)", fontWeight: 900, lineHeight: 1.05, color: th.ink, marginBottom: "1.5rem" }}
          >
            Not just a dev.{" "}
            <em style={{ color: A.accent }}>A whole vibe.</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{ fontFamily: F.sans, fontSize: "1rem", color: th.muted, maxWidth: "55ch", lineHeight: 1.85, marginBottom: "5rem" }}
          >
            Computer Engineering student obsessed with the intersection of design and engineering. Every pixel has a purpose, every API call should be{" "}
            <strong style={{ color: th.ink }}>intentional</strong>.
          </motion.p>

          {/* Timeline + Stickers grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", marginBottom: "5rem" }}>
            <div>
              <h3 style={{ fontFamily: F.display, fontSize: "1.6rem", fontWeight: 900, color: th.ink, marginBottom: "2rem" }}>Experience</h3>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 5, top: 6, bottom: 0, width: 1, background: th.border }} />
                {TIMELINE.map((t, i) => (
                  <TimelineItem key={t.year} {...t} i={i} th={th} />
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontFamily: F.display, fontSize: "1.6rem", fontWeight: 900, color: th.ink, marginBottom: "2rem" }}>Also, I'm into…</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                {[
                  { emoji: "🎌", label: "Anime",        sub: "FMAB is peak",           color: A.accent, rotation: -4,  delay: 0.1 },
                  { emoji: "🎬", label: "K-Dramas",     sub: "I have a ranked list",   color: A.sky,    rotation:  3,  delay: 0.2 },
                  { emoji: "🇫🇷", label: "French",      sub: "Intermediate (🥐)",      color: A.mint,   rotation: -2,  delay: 0.3 },
                  { emoji: "☕", label: "Café Coding",  sub: "Non-negotiable",         color: A.gold,   rotation:  5,  delay: 0.4 },
                  { emoji: "📐", label: "System Design",sub: "Atomic design fan",      color: A.lilac,  rotation: -3,  delay: 0.5 },
                  { emoji: "🎧", label: "Lo-fi Logic",  sub: "Deep work playlist",     color: A.mint,   rotation:  2,  delay: 0.6 },
                ].map(s => <Sticker key={s.label} {...s} th={th} />)}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 style={{ fontFamily: F.display, fontSize: "1.6rem", fontWeight: 900, color: th.ink, marginBottom: "0.5rem" }}>Skills</h3>
            <p style={{ fontFamily: F.mono, fontSize: "0.7rem", color: th.muted, marginBottom: "1.5rem" }}>✦ Drag any chip. They like it.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {SKILLS.map(s => <SkillChip key={s.label} {...s} />)}
            </div>
          </div>

          {/* Quote */}
          <motion.blockquote
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            style={{ marginTop: "4rem", padding: "2.5rem", background: th.quoteBlockBg, borderRadius: 20, borderLeft: `4px solid ${A.accent}`, transition: "background 0.5s" }}
          >
            <p style={{ fontFamily: F.display, fontSize: "1.4rem", fontStyle: "italic", color: th.ink, lineHeight: 1.5, margin: 0 }}>
              "I'm drawn to the <em>why</em> behind every click, scroll, and hesitation —{" "}
              <span style={{ color: A.accent }}>every interaction tells a story</span>."
            </p>
          </motion.blockquote>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CONTACT SECTION
      ══════════════════════════════════════ */}
      <section id="contact">
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "7rem 2rem" }}>

          <SectionLabel num="03" label="say bonjour" />
          <motion.h2
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE_SOFT }}
            style={{ fontFamily: F.display, fontSize: "clamp(2.8rem, 7vw, 6rem)", fontWeight: 900, lineHeight: 1.0, color: th.ink, marginBottom: "1.5rem" }}
          >
            Let's talk <em style={{ color: A.accent }}>tech</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            style={{ fontFamily: F.sans, fontSize: "0.95rem", color: th.muted, maxWidth: "50ch", lineHeight: 1.85, marginBottom: "3.5rem" }}
          >
            Whether it's a project, a collaboration, or discussing the latest design trends — my inbox is always open.{" "}
            <em style={{ color: A.accent }}>Say hello!</em>
          </motion.p>

          {/* Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: "5rem" }}>
            {SOCIAL_LINKS.map((l, i) => {
              const isCopy = l.href === "copy";
              return (
                <motion.a key={l.label}
                  href={isCopy ? "#" : l.href}
                  target={isCopy ? "_self" : "_blank"} rel="noreferrer"
                  onClick={isCopy ? (e) => handleCopy(e, l.sub) : undefined}
                  initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.1, duration: 0.5, ease: EASE_SOFT }}
                  whileHover={{ x: 10, transition: EASE_SPRING }}
                  style={{
                    display: "flex", alignItems: "center", gap: "1.5rem",
                    padding: "1.5rem 2rem", background: th.bgAlt,
                    border: `1.5px solid ${isCopy && copied ? A.mint : th.border}`,
                    borderRadius: 16, textDecoration: "none",
                    transition: "border-color 0.2s, background 0.5s",
                    cursor: isCopy ? "copy" : "pointer",
                  }}
                  onMouseEnter={e => { if (!(isCopy && copied)) e.currentTarget.style.borderColor = l.color; }}
                  onMouseLeave={e => { if (!(isCopy && copied)) e.currentTarget.style.borderColor = th.border; }}
                >
                  <span style={{ fontFamily: F.display, fontSize: "1.8rem", color: `${l.color}80`, minWidth: 40, textAlign: "center" }}>{l.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: F.display, fontSize: "1.2rem", fontWeight: 700, color: th.ink, marginBottom: 2 }}>
                      {l.label}
                      {isCopy && copied && <span style={{ fontFamily: F.mono, fontSize: "0.7rem", color: A.mint, marginLeft: 10, verticalAlign: "middle" }}>Copied! ✓</span>}
                    </div>
                    <div style={{ fontFamily: F.mono, fontSize: "0.73rem", color: l.color }}>{l.sub}</div>
                  </div>
                  {/* Icon */}
                  {isCopy ? (
                    copied
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={A.mint} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={l.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={l.color} strokeWidth="2" opacity="0.5"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
                  )}
                </motion.a>
              );
            })}
          </div>

          {/* Easter Egg */}
          <div style={{ textAlign: "center", paddingTop: "3rem", borderTop: `1px dashed ${th.border}` }}>
            <p style={{ fontFamily: F.mono, fontSize: "0.7rem", color: th.muted, marginBottom: "1.2rem", letterSpacing: "0.1em" }}>
              ⚠️ Easter egg below. You've been warned.
            </p>
            <motion.button ref={eggRef}
              onClick={fireConfetti}
              whileHover={{ scale: 1.08, rotate: [0, -3, 3, -2, 0], transition: { duration: 0.4 } }}
              whileTap={{ scale: 0.82, rotate: -5 }}
              transition={EASE_SPRING}
              style={{ fontFamily: F.sans, fontSize: "0.88rem", fontWeight: 700, padding: "0.8rem 2rem", borderRadius: 999, border: `2px dashed ${A.accent}`, color: A.accent, background: `${A.accent}08`, cursor: "pointer" }}
            >
              {eggClicks === 0 ? "🚫 Don't Click Me" : EASTER_MSGS[Math.min(eggClicks - 1, EASTER_MSGS.length - 1)]}
            </motion.button>
          </div>

          {/* Footer */}
          <div style={{ marginTop: "6rem", paddingTop: "2rem", borderTop: `1px solid ${th.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontFamily: F.display, fontSize: "2rem", fontWeight: 900, color: th.ink, opacity: 0.08 }}>SNEHA CHOUDHARY</span>
            <span style={{ fontFamily: F.mono, fontSize: "0.67rem", color: th.muted }}>© 2025 · Built with React & ☕</span>
          </div>
        </div>
      </section>

      {/* Confetti layer */}
      {confettis.map(c => <Confetti key={c.id} origin={c} />)}
    </div>
  );
}