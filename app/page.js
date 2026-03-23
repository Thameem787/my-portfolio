"use client";

import { useState, useEffect, useRef } from "react";

// ─── useInView ────────────────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

function Reveal({ children, delay = 0, y = 28 }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : `translateY(${y}px)`,
      transition: `opacity 0.75s cubic-bezier(0.4,0,0.2,1) ${delay}s, transform 0.75s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
    }}>{children}</div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Portfolio() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState("hero");
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [formSent, setFormSent] = useState(false);
  const [activeNav, setActiveNav] = useState("hero");
  const [password, setPassword] = useState("");
  const [authVisible, setAuthVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/portfolio');
      const json = await res.json();
      setData(json);
      setDraft(json);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setMenuOpen(false);
      setActiveNav(id);
    }
  };

  const openAdmin = () => { setAuthVisible(true); };

  const handleAdminLogin = () => {
    if (password === "admin123") {
      setDraft({ ...data });
      setAdminOpen(true);
      setAuthVisible(false);
      setPassword("");
    } else {
      alert("Invalid password!");
    }
  };

  const closeAdmin = () => setAdminOpen(false);

  const saveAdmin = async () => {
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: draft, password: "admin123" }),
      });

      if (res.ok) {
        setData({ ...draft });
        setSaved(true);
        setTimeout(() => { setSaved(false); setAdminOpen(false); }, 1200);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save");
      }
    } catch (error) {
      alert("Error saving: " + error.message);
    }
  };

  const handleUpload = async (e, callback) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const { url } = await res.json();
        callback(url);
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      alert("Upload error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const upd = (key, val) => setDraft(d => ({ ...d, [key]: val }));
  const updSkill = (i, key, val) => setDraft(d => ({ ...d, skills: d.skills.map((s, idx) => idx === i ? { ...s, [key]: val } : s) }));
  const updProject = (i, key, val) => setDraft(d => ({ ...d, projects: d.projects.map((p, idx) => idx === i ? { ...p, [key]: val } : p) }));
  const addProject = () => setDraft(d => ({ ...d, projects: [...d.projects, { title: "New Project", desc: "Description here.", tags: ["Tag"], imgUrl: "", github: "#", live: "#" }] }));
  const removeProject = (i) => setDraft(d => ({ ...d, projects: d.projects.filter((_, idx) => idx !== i) }));
  const updStat = (key, field, val) => setDraft(d => ({ ...d, [key]: { ...d[key], [field]: val } }));

  const handleContact = (e) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => { setFormSent(false); setFormState({ name: "", email: "", message: "" }); }, 2500);
  };

  if (loading || !data) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
        <p style={{ fontFamily: "Inter, sans-serif", color: "#4d44e3", fontWeight: 600 }}>Loading Experience...</p>
      </div>
    );
  }

  const colorMap = {
    primary: { bg: "#e2dfff", icon: "#4d44e3", hover: "#4d44e3", hoverIcon: "#faf6ff" },
    secondary: { bg: "#d9e3f7", icon: "#556071", hover: "#556071", hoverIcon: "#f8f8ff" },
    tertiary: { bg: "#e0e6ee", icon: "#596066", hover: "#596066", hoverIcon: "#f6f9ff" },
  };

  const ADMIN_TABS = ["hero", "about", "skills", "projects", "contact"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', system-ui, sans-serif; background: #f8f9fa; color: #2b3437; overflow-x: hidden; }
        .font-headline { font-family: 'Manrope', sans-serif; }
        .material-symbols-outlined { font-family: 'Material Symbols Outlined'; font-weight: normal; font-style: normal; font-size: 24px; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(77,68,227,0.25); border-radius:2px; }
        ::selection { background:#e2dfff; color:#3f33d6; }

        .nav-link { font-family:'Inter',sans-serif; font-size:0.75rem; letter-spacing:0.12em; text-transform:uppercase; font-weight:600; color:#586064; background:none; border:none; cursor:pointer; padding-bottom:4px; border-bottom:2px solid transparent; transition:all 0.3s cubic-bezier(0.4,0,0.2,1); }
        .nav-link:hover, .nav-link.active { color:#4d44e3; border-bottom-color:#4d44e3; }

        .btn-primary { background:linear-gradient(135deg,#4d44e3,#4034d7); color:#faf6ff; padding:18px 40px; border-radius:16px; font-family:'Inter',sans-serif; font-weight:600; font-size:0.95rem; border:none; cursor:pointer; transition:all 0.35s cubic-bezier(0.4,0,0.2,1); box-shadow:0 8px 32px rgba(77,68,227,0.2); }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 16px 48px rgba(77,68,227,0.3); }

        .btn-secondary { background:#e2e9ec; color:#2b3437; padding:18px 40px; border-radius:16px; font-family:'Inter',sans-serif; font-weight:600; font-size:0.95rem; border:none; cursor:pointer; transition:all 0.35s cubic-bezier(0.4,0,0.2,1); }
        .btn-secondary:hover { background:#dbe4e7; transform:translateY(-2px); }

        .skill-card { padding:40px; background:#ffffff; border-radius:2rem; transition:all 0.5s cubic-bezier(0.4,0,0.2,1); box-shadow:0 4px 20px rgba(43,52,55,0.04),0 10px 40px rgba(43,52,55,0.06); cursor:default; }
        .skill-card:hover { background:#eaeff1; transform:translateY(-8px); box-shadow:0 16px 60px rgba(43,52,55,0.10); }

        .project-img { width:100%; height:100%; object-fit:cover; transition:transform 1s cubic-bezier(0.4,0,0.2,1); }
        .project-group:hover .project-img { transform:scale(1.05); }

        .contact-input { width:100%; background:#f1f4f6; border:none; border-radius:0.75rem; padding:16px 18px; font-family:'Inter',sans-serif; font-size:0.9rem; color:#2b3437; outline:none; transition:all 0.3s cubic-bezier(0.4,0,0.2,1); }
        .contact-input:focus { background:#dbe4e7; box-shadow:0 0 0 2px rgba(77,68,227,0.2); }

        .label-tag { font-size:0.65rem; letter-spacing:0.2em; text-transform:uppercase; font-weight:700; color:#4d44e3; font-family:'Inter',sans-serif; }
        .pill-tag { padding:4px 12px; background:#e2e9ec; border-radius:9999px; font-size:0.62rem; font-family:'Inter',sans-serif; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#586064; }

        @keyframes float { 0%, 100% { transform: translateY(0) scale(1.0); } 50% { transform: translateY(-20px) scale(1.05); } }
        .blob { position: absolute; border-radius: 50%; filter: blur(120px); z-index: 0; opacity: 0.6; pointer-events: none; animation: float 10s ease-in-out infinite; }

        .admin-overlay { position:fixed; inset:0; z-index:9999; background:rgba(43,52,55,0.45); backdrop-filter:blur(6px); display:flex; align-items:stretch; justify-content:flex-end; }
        .admin-panel { width:min(520px,100vw); background:#ffffff; height:100vh; overflow-y:auto; box-shadow:-20px 0 80px rgba(43,52,55,0.15); display:flex; flex-direction:column; }
        .admin-header { padding:24px 28px 20px; border-bottom:1px solid #f1f4f6; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; background:#fff; z-index:10; }
        .admin-tabs { display:flex; gap:4px; padding:16px 28px; border-bottom:1px solid #f1f4f6; background:#f8f9fa; flex-wrap:wrap; }
        .admin-tab { padding:8px 16px; border-radius:9999px; border:none; cursor:pointer; font-family:'Inter',sans-serif; font-size:0.72rem; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; transition:all 0.25s ease; background:transparent; color:#586064; }
        .admin-tab.active { background:#4d44e3; color:#fff; }
        .admin-body { padding:28px; flex:1; }
        .admin-field { margin-bottom:20px; }
        .admin-label { display:block; font-size:0.68rem; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:#586064; margin-bottom:6px; }
        .admin-input { width:100%; background:#f1f4f6; border:none; border-radius:0.625rem; padding:12px 14px; font-family:'Inter',sans-serif; font-size:0.875rem; color:#2b3437; outline:none; transition:all 0.25s ease; resize:vertical; }
        .admin-card { background:#f8f9fa; border-radius:1rem; padding:18px; margin-bottom:16px; }
        .admin-footer { padding:20px 28px; border-top:1px solid #f1f4f6; display:flex; gap:12px; position:sticky; bottom:0; background:#fff; }
        .admin-save { flex:1; padding:14px; background:linear-gradient(135deg,#4d44e3,#4034d7); color:#fff; border:none; border-radius:12px; font-family:'Inter',sans-serif; font-weight:700; font-size:0.875rem; cursor:pointer; transition:all 0.3s ease; }
        .admin-cancel { padding:14px 24px; background:#e2e9ec; color:#2b3437; border:none; border-radius:12px; font-family:'Inter',sans-serif; font-weight:600; font-size:0.875rem; cursor:pointer; transition:all 0.3s ease; }

        .upload-btn { display:inline-flex; align-items:center; gap:8px; padding:8px 16px; background:#e2dfff; color:#4d44e3; border:none; border-radius:8px; font-family:'Inter',sans-serif; font-size:0.75rem; font-weight:700; cursor:pointer; margin-top:8px; transition:all 0.2s ease; }
        .upload-btn:hover { background:#d5d1ff; }
        .upload-btn:disabled { opacity:0.6; cursor:not-allowed; }

        .fab { position:fixed; bottom:28px; right:28px; z-index:8888; width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,#4d44e3,#4034d7); color:#fff; border:none; cursor:pointer; box-shadow:0 8px 32px rgba(77,68,227,0.35); display:flex; align-items:center; justify-content:center; font-size:1.3rem; transition:all 0.35s cubic-bezier(0.4,0,0.2,1); }
        .fab-label { position:absolute; right:64px; background:#2b3437; color:#fff; padding:6px 12px; border-radius:8px; font-size:0.72rem; font-weight:600; white-space:nowrap; opacity:0; pointer-events:none; transition:opacity 0.25s ease; }
        .fab:hover .fab-label { opacity:1; }

        .auth-overlay { position:fixed; inset:0; z-index:9999; background:rgba(43,52,55,0.6); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; }
        .auth-card { background:#fff; padding:40px; border-radius:2rem; width:min(400px, 90vw); box-shadow:0 20px 80px rgba(0,0,0,0.2); text-align:center; }

        @media (max-width:768px) {
          .nav-link-group { display: none !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, width: "100%", zIndex: 1000,
        background: scrolled ? "rgba(255,255,255,0.75)" : "transparent",
        backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
        boxShadow: scrolled ? "0 4px 20px rgba(43,52,55,0.05)" : "none",
        transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-0.03em", color: "#2b3437", cursor: "pointer" }} onClick={() => scrollTo("hero")}>
            {data.name.split(" ").pop().toUpperCase()}
          </div>
          <div className="nav-link-group" style={{ display: "flex", alignItems: "center", gap: 36 }}>
            {["hero", "about", "skills", "projects", "contact"].map(s => (
              <button key={s} className={`nav-link${activeNav === s ? " active" : ""}`} onClick={() => scrollTo(s)}>
                {s}
              </button>
            ))}
          </div>
          <button className="btn-primary" style={{ padding: "10px 24px", fontSize: "0.75rem", borderRadius: 9999 }} onClick={() => scrollTo("contact")}>
            Get in Touch
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#f8f9fa", paddingTop: 80 }}>
        <div className="blob" style={{ top: "-10%", left: "-10%", width: "60%", height: "60%", background: "radial-gradient(circle, rgba(77,68,227,0.15) 0%, transparent 70%)" }} />
        <div className="blob" style={{ bottom: "-10%", right: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(64,52,215,0.12) 0%, transparent 70%)", animationDelay: "-2s" }} />
        <div className="blob" style={{ top: "30%", left: "40%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(85,96,113,0.08) 0%, transparent 70%)", animationDelay: "-5s" }} />
        
        <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", padding: "0 40px", textAlign: "center" }}>
          <div className="label-tag" style={{ marginBottom: 24 }}>{data.role}</div>
          <h1 className="font-headline" style={{ fontSize: "clamp(2.8rem, 6vw, 4.5rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#2b3437", marginBottom: 28 }}>
            {data.heroTitle}
          </h1>
          <p style={{ maxWidth: 600, margin: "0 auto 48px", fontSize: "1.1rem", lineHeight: 1.75, color: "#586064" }}>
            {data.heroSub}
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => scrollTo("projects")}>View Projects</button>
            <button className="btn-secondary" onClick={() => scrollTo("contact")}>Get in Touch</button>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding: "120px 40px", background: "#f1f4f6" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 80, alignItems: "center" }}>
          <Reveal delay={0.1}>
            <div style={{ position: "relative", borderRadius: "2rem", overflow: "hidden", aspectRatio: "4/5", boxShadow: "0 20px 80px rgba(43,52,55,0.14)", maxHeight: 540 }}>
              <img src={data.aboutImgUrl || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80"} alt="Portrait" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </Reveal>
          <div>
            <Reveal delay={0.1}>
              <div className="label-tag" style={{ marginBottom: 16 }}>The Persona</div>
              <h2 className="font-headline" style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 700, lineHeight: 1.2, color: "#2b3437", marginBottom: 28 }}>{data.aboutTitle}</h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p style={{ fontSize: "1rem", lineHeight: 1.85, color: "#586064", marginBottom: 20 }}>{data.aboutP1}</p>
              <p style={{ fontSize: "1rem", lineHeight: 1.85, color: "#586064", marginBottom: 40 }}>{data.aboutP2}</p>
            </Reveal>
            <Reveal delay={0.3}>
              <div style={{ display: "flex", gap: 40, paddingTop: 32, borderTop: "1px solid rgba(171,179,183,0.25)" }}>
                {[data.stat1, data.stat2].map((st, i) => (
                  <div key={i}>
                    <div className="font-headline" style={{ fontSize: "2.2rem", fontWeight: 800, color: "#4d44e3" }}>{st.val}</div>
                    <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, color: "#586064", marginTop: 4 }}>{st.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── SKILLS ── */}
      <section id="skills" style={{ padding: "120px 40px", background: "#f8f9fa" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 72 }}>
              <div className="label-tag" style={{ marginBottom: 12 }}>Expertise</div>
              <h2 className="font-headline" style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 700, color: "#2b3437" }}>Curated Skillset</h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {data.skills.map((sk, i) => {
              const c = colorMap[sk.color] || colorMap.primary;
              return (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="skill-card">
                    <div style={{ width: 64, height: 64, borderRadius: "1rem", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 28, color: c.icon }}>{sk.icon}</span>
                    </div>
                    <h3 className="font-headline" style={{ fontSize: "1.3rem", fontWeight: 700, color: "#2b3437", marginBottom: 12 }}>{sk.title}</h3>
                    <p style={{ color: "#586064", lineHeight: 1.75, fontSize: "0.9rem" }}>{sk.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section id="projects" style={{ padding: "120px 40px", background: "#f1f4f6" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <Reveal>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 80 }}>
              <div>
                <div className="label-tag" style={{ marginBottom: 12 }}>Selected Works</div>
                <h2 className="font-headline" style={{ fontSize: "clamp(2rem, 3.5vw, 3.2rem)", fontWeight: 700, color: "#2b3437" }}>The Portfolio</h2>
              </div>
            </div>
          </Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: 96 }}>
            {data.projects.map((proj, i) => (
              <Reveal key={i} delay={0.1}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 64, alignItems: "center" }}>
                  <div style={{ order: i % 2 === 0 ? 0 : 1, borderRadius: "2rem", overflow: "hidden", aspectRatio: "16/9", boxShadow: "0 16px 60px rgba(43,52,55,0.09)" }}>
                    {proj.imgUrl ? <img src={proj.imgUrl} className="project-img" /> : <div style={{ height: "100%", background: "#e2e9ec" }} />}
                  </div>
                  <div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                      {proj.tags.map(t => <span key={t} className="pill-tag">{t}</span>)}
                    </div>
                    <h3 className="font-headline" style={{ fontSize: "2rem", fontWeight: 700, color: "#2b3437", marginBottom: 16 }}>{proj.title}</h3>
                    <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#586064", marginBottom: 32 }}>{proj.desc}</p>
                    <div style={{ display: "flex", gap: 16 }}>
                      {proj.github && (
                        <a href={proj.github} target="_blank" style={{ color: "#4d44e3", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>GitHub ↗</a>
                      )}
                      {proj.live && (
                        <a href={proj.live} target="_blank" style={{ color: "#586064", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>Live Demo ↗</a>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ padding: "120px 40px", background: "#f8f9fa" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <div className="label-tag" style={{ marginBottom: 12 }}>Collaboration</div>
            <h2 className="font-headline" style={{ fontSize: "3rem", fontWeight: 700, color: "#2b3437", marginBottom: 56 }}>Start a Conversation</h2>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              {[{ icon: "mail", val: data.email, label: "Email" }, { icon: "code", val: data.github, label: "GitHub" }, { icon: "work", val: data.linkedin, label: "LinkedIn" }].map(({ icon, val, label }) => (
                <a key={label} href={val.startsWith('http') ? val : `mailto:${val}`} target="_blank" style={{ textDecoration: 'none', padding: "12px 20px", background: "#ffffff", borderRadius: "0.875rem", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 10, color: '#586064' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#4d44e3" }}>{icon}</span>
                  {label}
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── ADMIN FAB ── */}
      <button className="fab" onClick={openAdmin}>
        <span className="fab-label">Admin Panel</span>
        <span className="material-symbols-outlined" style={{ color: "#fff", fontSize: 22 }}>edit</span>
      </button>

      {/* ── AUTH MODAL ── */}
      {authVisible && (
        <div className="auth-overlay">
          <div className="auth-card">
            <h2 className="font-headline" style={{ marginBottom: 20 }}>Admin Access</h2>
            <p style={{ color: "#586064", fontSize: "0.9rem", marginBottom: 24 }}>Enter password to access the edit panel.</p>
            <input type="password" className="contact-input" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdminLogin()} autoFocus />
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button className="admin-cancel" style={{ flex: 1 }} onClick={() => setAuthVisible(false)}>Cancel</button>
              <button className="admin-save" style={{ flex: 1 }} onClick={handleAdminLogin}>Login</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADMIN PANEL ── */}
      {adminOpen && (
        <div className="admin-overlay" onClick={e => { if (e.target === e.currentTarget) closeAdmin(); }}>
          <div className="admin-panel shadow-2xl">
            <div className="admin-header">
              <div>
                <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: "1rem" }}>✏️ Admin Edit Panel</div>
                <div style={{ fontSize: "0.7rem", color: "#586064" }}>Changes persist in data.json on save.</div>
              </div>
              <button onClick={closeAdmin} className="admin-cancel" style={{ padding: '8px 12px' }}>Close</button>
            </div>
            <div className="admin-tabs">
              {ADMIN_TABS.map(t => (
                <button key={t} className={`admin-tab${adminTab === t ? " active" : ""}`} onClick={() => setAdminTab(t)}>{t}</button>
              ))}
            </div>
            <div className="admin-body">
              {adminTab === "hero" && (
                <>
                  <div className="admin-field"><label className="admin-label">Name</label><input className="admin-input" value={draft.name} onChange={e => upd("name", e.target.value)} /></div>
                  <div className="admin-field"><label className="admin-label">Role</label><input className="admin-input" value={draft.role} onChange={e => upd("role", e.target.value)} /></div>
                  <div className="admin-field"><label className="admin-label">Hero Title</label><textarea className="admin-input" rows={3} value={draft.heroTitle} onChange={e => upd("heroTitle", e.target.value)} /></div>
                  <div className="admin-field"><label className="admin-label">Hero Subtitle</label><textarea className="admin-input" rows={3} value={draft.heroSub} onChange={e => upd("heroSub", e.target.value)} /></div>
                </>
              )}
              {adminTab === "about" && (
                <>
                  <div className="admin-field"><label className="admin-label">Title</label><input className="admin-input" value={draft.aboutTitle} onChange={e => upd("aboutTitle", e.target.value)} /></div>
                  <div className="admin-field"><label className="admin-label">Para 1</label><textarea className="admin-input" rows={4} value={draft.aboutP1} onChange={e => upd("aboutP1", e.target.value)} /></div>
                  <div className="admin-field"><label className="admin-label">Para 2</label><textarea className="admin-input" rows={4} value={draft.aboutP2} onChange={e => upd("aboutP2", e.target.value)} /></div>
                  <div className="admin-field">
                    <label className="admin-label">About Image URL</label>
                    <input className="admin-input" value={draft.aboutImgUrl} onChange={e => upd("aboutImgUrl", e.target.value)} />
                    <button className="upload-btn" onClick={() => document.getElementById('about-upload').click()} disabled={uploading}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>upload</span>
                      {uploading ? "Uploading..." : "Upload Local Image"}
                    </button>
                    <input id="about-upload" type="file" style={{ display: 'none' }} accept="image/*" onChange={e => handleUpload(e, url => upd("aboutImgUrl", url))} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="admin-field"><label className="admin-label">Stat 1 Val</label><input className="admin-input" value={draft.stat1.val} onChange={e => updStat("stat1", "val", e.target.value)} /></div>
                    <div className="admin-field"><label className="admin-label">Stat 1 Label</label><input className="admin-input" value={draft.stat1.label} onChange={e => updStat("stat1", "label", e.target.value)} /></div>
                  </div>
                </>
              )}
              {adminTab === "skills" && (
                <>
                  {draft.skills.map((sk, i) => (
                    <div className="admin-card" key={i}>
                      <div className="admin-field"><label className="admin-label">Skill {i+1} Title</label><input className="admin-input" value={sk.title} onChange={e => updSkill(i, "title", e.target.value)} /></div>
                      <div className="admin-field"><label className="admin-label">Description</label><textarea className="admin-input" rows={2} value={sk.desc} onChange={e => updSkill(i, "desc", e.target.value)} /></div>
                    </div>
                  ))}
                </>
              )}
              {adminTab === "projects" && (
                <>
                  <button className="btn-secondary" style={{ width: '100%', marginBottom: 20, padding: '12px' }} onClick={addProject}>+ Add Project</button>
                  {draft.projects.map((proj, i) => (
                    <div className="admin-card" key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontWeight: 700 }}>Project {i+1}</span>
                        <button style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => removeProject(i)}>Remove</button>
                      </div>
                      <div className="admin-field"><label className="admin-label">Title</label><input className="admin-input" value={proj.title} onChange={e => updProject(i, "title", e.target.value)} /></div>
                      <div className="admin-field"><label className="admin-label">Description</label><textarea className="admin-input" rows={2} value={proj.desc} onChange={e => updProject(i, "desc", e.target.value)} /></div>
                      <div className="admin-field">
                        <label className="admin-label">Image URL</label>
                        <input className="admin-input" value={proj.imgUrl} onChange={e => updProject(i, "imgUrl", e.target.value)} />
                        <button className="upload-btn" onClick={() => document.getElementById(`proj-upload-${i}`).click()} disabled={uploading}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>upload</span>
                          {uploading ? "Uploading..." : "Upload Local Image"}
                        </button>
                        <input id={`proj-upload-${i}`} type="file" style={{ display: 'none' }} accept="image/*" onChange={e => handleUpload(e, url => updProject(i, "imgUrl", url))} />
                      </div>
                      <div className="admin-field"><label className="admin-label">GitHub URL</label><input className="admin-input" value={proj.github} onChange={e => updProject(i, "github", e.target.value)} /></div>
                      <div className="admin-field"><label className="admin-label">Live URL</label><input className="admin-input" value={proj.live} onChange={e => updProject(i, "live", e.target.value)} /></div>
                    </div>
                  ))}
                </>
              )}
              {adminTab === "contact" && (
                <>
                  <div className="admin-field"><label className="admin-label">Email</label><input className="admin-input" value={draft.email} onChange={e => upd("email", e.target.value)} /></div>
                  <div className="admin-field"><label className="admin-label">GitHub URL</label><input className="admin-input" value={draft.github} onChange={e => upd("github", e.target.value)} /></div>
                  <div className="admin-field"><label className="admin-label">LinkedIn URL</label><input className="admin-input" value={draft.linkedin} onChange={e => upd("linkedin", e.target.value)} /></div>
                </>
              )}
            </div>
            <div className="admin-footer">
              <button className="admin-cancel" onClick={closeAdmin}>Cancel</button>
              <button className="admin-save" onClick={saveAdmin}>{saved ? "✓ Saved!" : "Save Permanently"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
