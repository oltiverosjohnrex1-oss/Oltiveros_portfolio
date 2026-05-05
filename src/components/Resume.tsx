import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { ParticleField } from './ParticleField'
import { TiltCard } from './TiltCard'

/* ─── Data ─────────────────────────────────────────────────── */
const SKILLS = {
  'Languages & Frameworks': [
    { name: 'PHP', icon: 'https://cdn.simpleicons.org/php/777BB4' },
    { name: 'Laravel', icon: 'https://cdn.simpleicons.org/laravel/FF2D20' },
    { name: 'JavaScript', icon: 'https://cdn.simpleicons.org/javascript/F7DF1E' },
    { name: 'React Native', icon: 'https://cdn.simpleicons.org/react/61DAFB' },
    { name: 'HTML5', icon: 'https://cdn.simpleicons.org/html5/E34F26' },
    { name: 'CSS3', icon: 'https://cdn.simpleicons.org/css3/1572B6' },
    { name: 'Java', icon: 'https://cdn.simpleicons.org/coffeescript/2F2625' },
    { name: 'Python', icon: 'https://cdn.simpleicons.org/python/3776AB' },
    { name: 'C', icon: 'https://cdn.simpleicons.org/c/A8B9CC' },
    { name: 'C#', icon: 'https://cdn.simpleicons.org/csharp/239120' },
  ],
  'Databases & Cloud': [
    { name: 'MySQL', icon: 'https://cdn.simpleicons.org/mysql/4479A1' },
    { name: 'Firebase', icon: 'https://cdn.simpleicons.org/firebase/FFCA28' },
    { name: 'Firestore', icon: 'https://cdn.simpleicons.org/firebase/FF6F00' },
    { name: 'SQLite', icon: 'https://cdn.simpleicons.org/sqlite/003B57' },
    { name: 'Supabase', icon: 'https://cdn.simpleicons.org/supabase/3ECF8E' },
    { name: 'Google Sheets', icon: 'https://cdn.simpleicons.org/googlesheets/34A853' },
    { name: 'Apps Script', icon: 'https://cdn.simpleicons.org/googleappsscript/4285F4' },
  ],
  'Tools & Office': [
    { name: 'Git', icon: 'https://cdn.simpleicons.org/git/F05032' },
    { name: 'GitHub', icon: 'https://cdn.simpleicons.org/github/181717' },
    { name: 'MS Office', icon: 'https://cdn.simpleicons.org/microsoftoffice/D83B01' },
    { name: 'Google Workspace', icon: 'https://cdn.simpleicons.org/google/4285F4' },
  ],
}

const PROJECTS = [
  {
    title: 'QR-Based OJT Attendance',
    year: '2025 — 2026',
    org: 'Baao Community College — ACT · Major in Application Development',
    desc: 'Android app that scans student QR codes to record OJT time-in/time-out in real time via Google Apps Script and Google Sheets. Supports 200+ students with duplicate scan prevention and auto late detection.',
    features: [
      'Duplicate scan prevention with session-based validation',
      'Auto late detection after 8:00 AM with AM/PM session separation',
      'Monthly DTR generation with overtime calculation',
      'Real-time cloud sync via Google Apps Script & Sheets',
    ],
    tech: ['App Inventor', 'Apps Script', 'Google Sheets'],
  },
  {
    title: 'BCC OJT Management System',
    year: '2025',
    org: 'Baao Community College — ACT · Major in Application Development',
    desc: 'PHP/Laravel web application for the Practicum & OJT Coordinator. Manages student OJT records, accreditation documents, and generates DTR reports for 300+ students. Includes admin and coordinator roles.',
    features: [
      'Multi-role auth (admin, coordinator, student)',
      'Automated DTR computation with overtime rules',
      'Document upload and accreditation tracker',
      'Batch export to Excel/PDF for official records',
    ],
    tech: ['PHP', 'Laravel', 'MySQL', 'Bootstrap'],
  },
  {
    title: 'BCC Alumni Tracer System',
    year: '2024',
    org: 'Baao Community College — ACT · Major in Application Development',
    desc: 'Firebase-powered cross-platform mobile app (React Native + Expo) that tracks alumni employment outcomes. Geo-tags current employer location and sends push notifications for survey campaigns. Used by 500+ alumni.',
    features: [
      'Geo-tagged employer locations with Google Maps integration',
      'Push notification campaigns via Firebase Cloud Messaging',
      'Cross-platform iOS/Android with Expo',
      'Real-time dashboard for admin analytics',
    ],
    tech: ['React Native', 'Firebase', 'Expo', 'Firestore'],
  },
]

/* ─── Counter animation ─────────────────────────────────────── */
function useCounter(target: number, duration = 1500) {
  const [value, setValue] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          const start = performance.now()
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setValue(Math.round(eased * target))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration, started])

  return { value, ref }
}

/* ─── Reveal on scroll ──────────────────────────────────────── */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Stat item ─────────────────────────────────────────────── */
function StatItem({ value, label, suffix = '+' }: { value: number; label: string; suffix?: string }) {
  const { value: count, ref } = useCounter(value)
  return (
    <div className="stat-item">
      <span className="stat-number" ref={ref}>
        {count}{suffix}
      </span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

/* ─── Cursor ────────────────────────────────────────────────── */
function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0 })
  const ringPos = useRef({ x: 0, y: 0 })
  const raf = useRef<number>(0)

  useEffect(() => {
    const move = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (dot.current) {
        dot.current.style.transform = `translate(${e.clientX - 5}px, ${e.clientY - 5}px)`
      }
    }
    const lerp = () => {
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.12
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.12
      if (ring.current) {
        ring.current.style.transform = `translate(${ringPos.current.x - 18}px, ${ringPos.current.y - 18}px)`
      }
      raf.current = requestAnimationFrame(lerp)
    }
    raf.current = requestAnimationFrame(lerp)
    window.addEventListener('mousemove', move, { passive: true })
    return () => {
      window.removeEventListener('mousemove', move)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <>
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring" />
    </>
  )
}

/* ─── Scroll progress ───────────────────────────────────────── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const width = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })
  return (
    <motion.div
      className="scroll-progress-bar"
      style={{ scaleX: width, transformOrigin: 'left' }}
    />
  )
}

/* ─── Floating 3D hero text ─────────────────────────────────── */
function HeroName() {
  const ref = useRef<HTMLHeadingElement>(null)

  const onMove = useCallback((e: MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / window.innerWidth
    const dy = (e.clientY - cy) / window.innerHeight
    el.style.textShadow = `
      ${dx * -20}px ${dy * -20}px 0px rgba(196,185,168,0.8),
      ${dx * -35}px ${dy * -35}px 0px rgba(196,185,168,0.4),
      ${dx * -50}px ${dy * -50}px 0px rgba(196,185,168,0.15)
    `
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [onMove])

  return (
    <motion.h1
      ref={ref}
      className="hero-name-3d"
      initial={{ opacity: 0, y: 60, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1.4, ease: [0.19, 1, 0.22, 1], delay: 0.2 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      John Rex
      <br />
      <em>Oltiveros</em>
    </motion.h1>
  )
}

/* ─── Main resume ───────────────────────────────────────────── */
export function Resume() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const heroParallax = useTransform(scrollY, [0, 600], [0, -120])
  const [activeSection, setActiveSection] = useState('hero')
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }, [])

  // Section observer for nav active state
  useEffect(() => {
    const sections = ['hero', 'about', 'skills', 'experience', 'projects', 'contact']
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id)
        })
      },
      { rootMargin: '-40% 0px -50% 0px' }
    )
    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  const navLinks = ['about', 'skills', 'experience', 'projects', 'contact']

  return (
    <div className="resume-root" ref={containerRef}>
      <CustomCursor />
      <ScrollProgress />

      {/* ── Nav ── */}
      <nav className={`resume-nav`}>
        <div className="resume-container">
          <button className="nav-logo" onClick={() => scrollTo('hero')}>
            <div className="nav-logo-mark">
              <svg viewBox="0 0 18 18" fill="currentColor">
                <rect x="2" y="2" width="6" height="6" rx="1" />
                <rect x="10" y="2" width="6" height="6" rx="1" opacity="0.6" />
                <rect x="2" y="10" width="6" height="6" rx="1" opacity="0.4" />
                <rect x="10" y="10" width="6" height="6" rx="1" opacity="0.8" />
              </svg>
            </div>
            <span className="nav-logo-text">JRO</span>
          </button>

          <div className="nav-links hidden-mobile">
            {navLinks.map((id) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={activeSection === id ? 'active' : ''}
              >
                {id}
              </button>
            ))}
          </div>

          <button
            className={`menu-toggle ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="mobile-menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {navLinks.map((id) => (
                <button key={id} onClick={() => scrollTo(id)}>
                  {id}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Hero ── */}
      <section id="hero" className="hero-section">
        <ParticleField />
        <motion.div
          className="resume-container hero-content"
          style={{ y: heroParallax }}
        >
          <Reveal>
            <p className="hero-label">Available for Work · June 2026</p>
          </Reveal>

          <HeroName />

          <Reveal delay={0.35}>
            <p className="hero-bio">
              Associate in Computer Technology student at Baao Community College. Full-stack developer
              specializing in PHP, React Native, and cloud-based systems. I build institutional software
              that solves real problems for real people.
            </p>
          </Reveal>

          <Reveal delay={0.45}>
            <div className="hero-meta">
              <span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Baao, Camarines Sur, PH
              </span>
              <span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                rexoltiveros@gmail.com
              </span>
              <span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
                github.com/rexoltiveros
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.55}>
            <div className="hero-stats">
              <StatItem value={3} label="Major Projects" />
              <StatItem value={400} label="OJT Hours" />
              <StatItem value={500} label="Alumni Tracked" suffix="+" />
              <StatItem value={200} label="Students Served" suffix="+" />
            </div>
          </Reveal>

          <div className="scroll-hint">
            <div className="scroll-hint-line" />
            scroll
          </div>
        </motion.div>
      </section>

      {/* ── Ticker ── */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          {['Full-Stack Developer', 'PHP · Laravel', 'React Native', 'Firebase · Firestore', 'Android Development', 'Institutional Systems', 'Cloud Architecture', 'Available June 2026'].map((t, i) => (
            <div key={`a${i}`} className="ticker-item">
              <span className="ticker-dot" /> {t}
            </div>
          ))}
          {['Full-Stack Developer', 'PHP · Laravel', 'React Native', 'Firebase · Firestore', 'Android Development', 'Institutional Systems', 'Cloud Architecture', 'Available June 2026'].map((t, i) => (
            <div key={`b${i}`} className="ticker-item">
              <span className="ticker-dot" /> {t}
            </div>
          ))}
        </div>
      </div>

      {/* ── About ── */}
      <section id="about" className="resume-section">
        <span className="section-big-num">01</span>
        <div className="resume-container">
          <Reveal>
            <span className="section-label">01 // About</span>
          </Reveal>
          <div className="about-grid">
            <Reveal delay={0.1} className="about-text-col">
              <p className="about-p">
                I'm a final-year ACT student building real software for real institutions. My capstone projects
                are deployed and actively used — not demos. I care about code quality, clean architecture,
                and systems that actually hold up under load.
              </p>
              <p className="about-p">
                Outside of coding I obsess over typography, monochrome aesthetics, and writing clean SQL.
                I believe the best software is the kind that quietly disappears — so users can focus on
                their actual work.
              </p>
              <div className="about-chips">
                {['PHP', 'Laravel', 'React Native', 'Firebase', 'MySQL', 'Git'].map((t) => (
                  <span key={t} className="about-chip">{t}</span>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.25} className="about-card-col">
              <TiltCard className="about-card" max={8}>
                <div className="about-card-inner" style={{ transform: 'translateZ(20px)' }}>
                  <div className="about-card-avatar">JRO</div>
                  <h3>John Rex Oltiveros</h3>
                  <p>Associate in Computer Technology</p>
                  <div className="about-card-divider" />
                  <div className="about-card-details">
                    <div>
                      <span>School</span>
                      <strong>Baao Community College</strong>
                    </div>
                    <div>
                      <span>Major</span>
                      <strong>Application Development</strong>
                    </div>
                    <div>
                      <span>Status</span>
                      <strong>Open to Work</strong>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Skills ── */}
      <section id="skills" className="resume-section">
        <span className="section-big-num">02</span>
        <div className="resume-container">
          <Reveal>
            <span className="section-label">02 // Skills</span>
          </Reveal>
          <div className="skills-grid">
            {Object.entries(SKILLS).map(([cat, items], ci) => (
              <Reveal key={cat} delay={ci * 0.1}>
                <TiltCard className="skill-category-card" max={6}>
                  <div className="skill-cat-header" style={{ transform: 'translateZ(12px)' }}>
                    <h4>{cat}</h4>
                    <span className="skill-count">{items.length}</span>
                  </div>
                  <div className="skill-items" style={{ transform: 'translateZ(8px)' }}>
                    {items.map((s) => (
                      <div key={s.name} className="skill-tag">
                        <img
                          src={s.icon}
                          alt={s.name}
                          width={16}
                          height={16}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                        {s.name}
                      </div>
                    ))}
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Experience ── */}
      <section id="experience" className="resume-section">
        <span className="section-big-num">03</span>
        <div className="resume-container">
          <Reveal>
            <span className="section-label">03 // Experience</span>
          </Reveal>
          <Reveal delay={0.15}>
            <TiltCard className="exp-card" max={5}>
              <div className="exp-inner" style={{ transform: 'translateZ(10px)' }}>
                <div className="exp-header">
                  <h3 className="exp-title">IT 
                  <span className="exp-meta">2025 — 2026 · 400 Hours</span>
                </div>
                <div className="exp-org">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Municipal Tourism Office of Baao — Baao, Camarines Sur
                </div>
                <ul className="exp-details">
                  <li>Completed 400 hours of on-the-job training in a government office setting</li>
                  <li>Assisted with data encoding, document preparation, and records management using MS Office and Google Workspace</li>
                  <li>Gained experience in professional office protocols, interdepartmental coordination, and public-facing service in a local government unit</li>
                </ul>
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      {/* ── Projects ── */}
      <section id="projects" className="resume-section">
        <span className="section-big-num">04</span>
        <div className="resume-container">
          <Reveal>
            <span className="section-label">04 // Projects</span>
          </Reveal>
          <div className="projects-list">
            {PROJECTS.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.12}>
                <TiltCard className="project-card" max={7} scale={1.02}>
                  <div className="project-inner" style={{ transform: 'translateZ(14px)' }}>
                    <div className="project-header">
                      <h3 className="project-title">{p.title}</h3>
                      <span className="project-year">{p.year}</span>
                    </div>
                    <div className="project-org">{p.org}</div>
                    <p className="project-desc">{p.desc}</p>
                    <ul className="project-features">
                      {p.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    <div className="project-footer">
                      <div className="project-tech">
                        {p.tech.map((t) => (
                          <span key={t} className="tech-item">{t}</span>
                        ))}
                      </div>
                      <button
                        className="project-link"
                        onClick={() => showToast(`${p.title} — demo available on request`)}
                      >
                        View Demo
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="resume-section">
        <span className="section-big-num">05</span>
        <div className="resume-container">
          <Reveal>
            <span className="section-label">05 // Contact</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="contact-heading">Let's build something together.</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="contact-sub">
              Open to internships, freelance projects, and full-time roles starting June 2026.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="contact-links">
              {[
                {
                  label: 'Email',
                  sub: 'rexoltiveros@gmail.com',
                  icon: '✉',
                  action: () => {
                    navigator.clipboard.writeText('rexoltiveros@gmail.com')
                    showToast('Email copied to clipboard!')
                  },
                },
                {
                  label: 'GitHub',
                  sub: 'github.com/rexoltiveros',
                  icon: '⌥',
                  action: () => showToast('GitHub — open browser to visit'),
                },
                {
                  label: 'Phone',
                  sub: '+63 912 345 6789',
                  icon: '☎',
                  action: () => {
                    navigator.clipboard.writeText('+639123456789')
                    showToast('Phone copied to clipboard!')
                  },
                },
              ].map((c) => (
                <TiltCard key={c.label} className="contact-card" max={10}>
                  <button className="contact-link-btn" onClick={c.action} style={{ transform: 'translateZ(16px)' }}>
                    <span className="contact-icon">{c.icon}</span>
                    <div>
                      <div className="contact-label">{c.label}</div>
                      <div className="contact-val">{c.sub}</div>
                    </div>
                  </button>
                </TiltCard>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="resume-footer">
        <div className="resume-container footer-inner">
          <span>© 2026 John Rex Oltiveros</span>
          <span>Baao, Camarines Sur, Philippines</span>
          <button className="footer-back" onClick={() => scrollTo('hero')}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
            </svg>
            Back to top
          </button>
        </div>
      </footer>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast-msg"
            initial={{ opacity: 0, y: 60, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 60, x: '-50%' }}
            transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
