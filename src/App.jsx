import { useState, useEffect, useRef, useCallback } from "react";

// ─── COLORS ────────────────────────────────────────────────────────────────────
const C = {
  nylBlue: "#0073BD",
  nylDark: "#00385E",
  sky: "#4A90D9",
  green: "#22C55E",
  greenBg: "#F0FDF4",
  greenBorder: "#86EFAC",
  red: "#EF4444",
  redBg: "#FEF2F2",
  redBorder: "#FECACA",
  orange: "#D97706",
  purple: "#7C3AED",
  purpleBg: "#F5F3FF",
  purpleBorder: "#C4B5FD",
  bg: "#F0F7FC",
  card: "#FFFFFF",
  cardHover: "#F8FAFC",
  textBright: "#0F172A",
  textMid: "#475569",
  textDim: "#94A3B8",
  coral: "#DC2626",
  codeBg: "#1E293B",
  codeText: "#E2E8F0",
};

const font = "'DM Sans', 'Helvetica Neue', system-ui, sans-serif";
const monoFont = "'Fira Code', 'SF Mono', 'Consolas', monospace";

// ─── BLOCK CATEGORIES ──────────────────────────────────────────────────────────
const BLOCK_COLORS = {
  input: { bg: "#1A3A5C", border: "#2B7ACC", color: "#5BA8F7" },
  logic: { bg: "#1A3C2E", border: "#27AE60", color: "#4CD787" },
  api: { bg: "#2E2A1A", border: "#F39C12", color: "#FFC04D" },
  output: { bg: "#3C1A2E", border: "#E91E8F", color: "#F06CB8" },
};

// ─── LEVEL DATA ────────────────────────────────────────────────────────────────
const levels = [
  {
    id: 1,
    type: "build",
    title: "Collect Applicant Info",
    subtitle: "Level 1 · Build",
    icon: "🛠️",
    description: "A user just submitted the online insurance application form. Build the function that grabs their info and validates it.",
    hint: "Think: grab the data → check it's all there → return it.",
    blocks: [
      { id: "b1a", code: `function collectApplicantInfo(form) {`, cat: "input", order: 1 },
      { id: "b1b", code: `  const { fullName, age, planType } = form;`, cat: "input", order: 2 },
      { id: "b1c", code: `  if (!fullName || !age || !planType) {\n    return { error: "All fields required" };\n  }`, cat: "logic", order: 3 },
      { id: "b1d", code: `  return { fullName, age, planType, status: "received" };\n}`, cat: "output", order: 4 },
    ],
    debrief: {
      title: "Nice work!",
      emoji: "✅",
      message: "You just built a data collection function — the foundation of every feature. In real life, we always validate inputs first. Bad data in = bad data out.",
      realTalk: "At NYL, every form submission goes through validation like this before it touches our systems.",
    },
  },
  {
    id: 2,
    type: "review",
    title: "AI's Eligibility Check",
    subtitle: "Level 2 · AI Review",
    icon: "🤖",
    description: "You asked AI to write a function that checks if someone is eligible to apply. It looks legit... but AI hallucinated something. Can you find it?",
    hint: "AI loves making up things that sound real but don't exist. Look at every reference carefully — does it actually exist?",
    codeLines: [
      { id: "r2a", code: `async function checkEligibility(applicant) {`, hasBug: false },
      { id: "r2b", code: `  const { age, state } = applicant;`, hasBug: false },
      { id: "r2c", code: `  const rules = await fetch(\n    "/api/v3/underwriting/eligibility-matrix"\n  );`, hasBug: true, bugExplanation: "🤖 AI HALLUCINATION! This API endpoint \"/api/v3/underwriting/eligibility-matrix\" doesn't exist in our codebase. AI made it up because it sounds plausible. In production, this would throw a 404 error and crash the whole feature. Always verify that APIs, libraries, and endpoints actually exist before using AI-generated code!" },
      { id: "r2d", code: `  if (age >= 18 && age <= 65) {\n    return { eligible: true };\n  }\n  return { eligible: false };\n}`, hasBug: false },
    ],
    debrief: {
      title: "You caught the hallucination!",
      emoji: "🎯",
      message: "AI invented an API endpoint that sounds real but doesn't exist. This is one of the most common AI mistakes — it generates plausible-sounding URLs, function names, and library methods that are completely made up.",
      realTalk: "At NYL, we verify every API call, import, and reference in AI-generated code. If you can't find it in the docs, it probably doesn't exist.",
    },
  },
  {
    id: 3,
    type: "build",
    title: "Calculate Premium & Submit",
    subtitle: "Level 3 · Build",
    icon: "🛠️",
    description: "Now build the function that calculates the monthly premium and submits the application to the server.",
    hint: "The flow: figure out the rate → calculate the price → send it → return confirmation.",
    blocks: [
      { id: "b3a", code: `async function calculateAndSubmit(applicant) {`, cat: "input", order: 1 },
      { id: "b3b", code: `  const rate = applicant.planType === "whole"\n    ? 1.8 : 1.2;\n  const premium = applicant.age * rate;`, cat: "logic", order: 2 },
      { id: "b3c", code: `  const res = await fetch("/api/submit", {\n    method: "POST",\n    body: JSON.stringify({ ...applicant, premium })\n  });`, cat: "api", order: 3 },
      { id: "b3d", code: `  const data = await res.json();\n  return { confirmed: true, id: data.policyId };\n}`, cat: "output", order: 4 },
    ],
    debrief: {
      title: "Feature shipped!",
      emoji: "🚀",
      message: "You just connected frontend to backend! That fetch() call is how every web app sends data to a server. At NYL, our APIs handle thousands of these submissions daily.",
      realTalk: "This POST request pattern is something we write almost every day — it's the backbone of how the web works.",
    },
  },
  {
    id: 4,
    type: "review",
    title: "AI's Confirmation Email",
    subtitle: "Level 4 · AI Review",
    icon: "🤖",
    description: "AI generated code to send a confirmation email after someone applies. But there's a serious security problem hiding in here.",
    hint: "Think about what information should NEVER be visible in logs or output. What would a hacker love to find?",
    codeLines: [
      { id: "r4a", code: `async function sendConfirmation(applicant) {`, hasBug: false },
      { id: "r4b", code: `  const emailBody = "Welcome, " + applicant.name\n    + "! Your policy is pending review.";`, hasBug: false },
      { id: "r4c", code: `  console.log("Sending to:", applicant.email,\n    "SSN:", applicant.ssn);`, hasBug: true, bugExplanation: "🚨 SECURITY HOLE! This logs the applicant's Social Security Number to the console. In production, logs get stored in monitoring systems — anyone with access could see it. AI doesn't understand what's sensitive — it just generates code that 'works.' Never log PII (Personally Identifiable Information)!" },
      { id: "r4d", code: `  await emailService.send({\n    to: applicant.email,\n    subject: "Application Received",\n    body: emailBody\n  });\n}`, hasBug: false },
    ],
    debrief: {
      title: "Security issue caught!",
      emoji: "🔒",
      message: "This is a REAL security vulnerability we watch for. AI doesn't understand what's sensitive — it just generates code that compiles. Engineers are the last line of defense for your data.",
      realTalk: "At NYL, every code review checks for PII exposure. One leaked SSN could be a major compliance violation.",
    },
  },
];

// ─── SHUFFLE ───────────────────────────────────────────────────────────────────
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── CSS KEYFRAMES ─────────────────────────────────────────────────────────────
const cssInjected = { current: false };
function injectCSS() {
  if (cssInjected.current) return;
  cssInjected.current = true;
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap');
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes dropIn { from { opacity: 0; transform: translateY(-10px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes pulseBtn { 0%, 100% { box-shadow: 0 4px 24px rgba(0,115,189,0.35); } 50% { box-shadow: 0 4px 36px rgba(0,115,189,0.55); } }
    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
    @keyframes shakeX { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
    @keyframes confetti1 { 0% { transform: translate(0,0) rotate(0deg); opacity:1; } 100% { transform: translate(-60px,-120px) rotate(360deg); opacity:0; } }
    @keyframes confetti2 { 0% { transform: translate(0,0) rotate(0deg); opacity:1; } 100% { transform: translate(60px,-100px) rotate(-360deg); opacity:0; } }
    @keyframes confetti3 { 0% { transform: translate(0,0) rotate(0deg); opacity:1; } 100% { transform: translate(-30px,-140px) rotate(270deg); opacity:0; } }
    @keyframes confetti4 { 0% { transform: translate(0,0) rotate(0deg); opacity:1; } 100% { transform: translate(40px,-110px) rotate(-270deg); opacity:0; } }
    @keyframes confetti5 { 0% { transform: translate(0,0) rotate(0deg); opacity:1; } 100% { transform: translate(50px,-130px) rotate(300deg); opacity:0; } }
    @keyframes confetti6 { 0% { transform: translate(0,0) rotate(0deg); opacity:1; } 100% { transform: translate(-50px,-95px) rotate(-300deg); opacity:0; } }
    @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 10px rgba(34,197,94,0.3); } 50% { box-shadow: 0 0 30px rgba(34,197,94,0.5); } }
  `;
  document.head.appendChild(style);
}

// ─── PROGRESS BAR ──────────────────────────────────────────────────────────────
function ProgressBar({ current, total }) {
  const labels = ["Build", "AI Review", "Build", "AI Review"];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 20, alignItems: "flex-end" }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{ flex: 1, textAlign: "center" }}>
          <div style={{
            height: 5, borderRadius: 3,
            background: i < current ? C.green : i === current ? C.nylBlue : "#D1E3F0",
            transition: "all 0.4s ease",
          }} />
          <div style={{
            fontSize: 9, marginTop: 4, fontWeight: 700, letterSpacing: 0.5,
            color: i === current ? C.nylBlue : i < current ? C.green : C.textDim,
          }}>{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}

// ─── DRAGGABLE CODE BLOCKS ─────────────────────────────────────────────────────
function DraggableBlocks({ blocks, onReorder }) {
  const [items, setItems] = useState(blocks);
  const [dragIdx, setDragIdx] = useState(null);
  const [touchDragIdx, setTouchDragIdx] = useState(null);
  const containerRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => { setItems(blocks); }, [blocks]);
  useEffect(() => { onReorder(items.map(i => i.id)); }, [items, onReorder]);

  const handleDragStart = (e, idx) => { setDragIdx(idx); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const n = [...items]; const [m] = n.splice(dragIdx, 1); n.splice(idx, 0, m);
    setItems(n); setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  const handleTouchStart = (e, idx) => { setTouchDragIdx(idx); };
  const handleTouchMove = useCallback((e) => {
    if (touchDragIdx === null) return;
    e.preventDefault();
    const y = e.touches[0].clientY;
    for (let i = 0; i < itemRefs.current.length; i++) {
      if (i === touchDragIdx || !itemRefs.current[i]) continue;
      const rect = itemRefs.current[i].getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if ((y < mid && touchDragIdx > i) || (y > mid && touchDragIdx < i)) {
        const n = [...items]; const [m] = n.splice(touchDragIdx, 1); n.splice(i, 0, m);
        setItems(n); setTouchDragIdx(i); break;
      }
    }
  }, [touchDragIdx, items]);
  const handleTouchEnd = () => setTouchDragIdx(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", handleTouchMove);
  }, [handleTouchMove]);

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((block, idx) => {
        const isDragging = dragIdx === idx || touchDragIdx === idx;
        return (
          <div
            key={block.id}
            ref={el => itemRefs.current[idx] = el}
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            onTouchStart={(e) => handleTouchStart(e, idx)}
            onTouchEnd={handleTouchEnd}
            style={{
              background: "#1E293B",
              border: `2px solid ${isDragging ? C.nylBlue : "transparent"}`,
              borderRadius: 12,
              padding: "12px 14px",
              cursor: "grab",
              opacity: isDragging ? 0.9 : 1,
              transform: isDragging ? "scale(1.03)" : "scale(1)",
              boxShadow: isDragging ? "0 8px 24px rgba(0,56,94,0.2)" : "0 2px 8px rgba(0,56,94,0.1)",
              transition: "transform 0.15s ease, opacity 0.15s ease, border-color 0.15s ease",
              display: "flex",
              alignItems: "center",
              gap: 12,
              userSelect: "none",
              WebkitUserSelect: "none",
              touchAction: "none",
              animation: `dropIn 0.25s ease ${idx * 0.05}s both`,
            }}
          >
            {/* Drag handle */}
            <div style={{ display: "flex", flexDirection: "column", gap: 3, flexShrink: 0 }}>
              {[0,1,2].map(r => (
                <div key={r} style={{ display: "flex", gap: 3 }}>
                  <div style={{ width: 5, height: 5, borderRadius: 5, background: C.nylBlue, opacity: 0.7 }} />
                  <div style={{ width: 5, height: 5, borderRadius: 5, background: C.nylBlue, opacity: 0.7 }} />
                </div>
              ))}
            </div>
            <pre style={{
              fontFamily: monoFont, fontSize: 12, lineHeight: 1.5,
              color: "#E2E8F0", margin: 0,
              whiteSpace: "pre-wrap", wordBreak: "break-word", flex: 1,
            }}>
              {block.code}
            </pre>
          </div>
        );
      })}
    </div>
  );
}

// ─── BUILD LEVEL ───────────────────────────────────────────────────────────────
function BuildLevel({ level, onComplete }) {
  const [shuffled] = useState(() => shuffleArray(level.blocks));
  const [currentOrder, setCurrentOrder] = useState(shuffled.map(b => b.id));
  const [showHint, setShowHint] = useState(false);
  const [checking, setChecking] = useState(false);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleReorder = useCallback((newOrder) => {
    setCurrentOrder(newOrder);
  }, []);

  function handleCheck() {
    setChecking(true);
    const correctOrder = level.blocks.map(b => b.id);
    const isCorrect = currentOrder.every((id, i) => id === correctOrder[i]);
    setTimeout(() => {
      if (isCorrect) {
        onComplete();
      } else {
        setShakeWrong(true);
        setAttempts(a => a + 1);
        setChecking(false);
        setTimeout(() => setShakeWrong(false), 600);
      }
    }, 500);
  }

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <div style={{
        background: "#E8F4FD",
        border: "1px solid #B8DCEF",
        borderRadius: 12, padding: "12px 14px", marginBottom: 12,
      }}>
        <p style={{ color: C.textBright, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{level.description}</p>
      </div>

      {showHint && (
        <div style={{
          background: "#FFF8E8", border: "1px solid #FDE68A",
          borderRadius: 10, padding: "10px 14px", marginBottom: 12,
          fontSize: 13, color: C.orange, animation: "fadeUp 0.3s ease both",
        }}>
          💡 {level.hint}
        </div>
      )}
      {!showHint && (
        <button onClick={() => setShowHint(true)} style={{
          background: "none", border: "none", color: C.sky, fontSize: 13,
          cursor: "pointer", padding: 0, marginBottom: 12, textDecoration: "underline",
        }}>Need a hint?</button>
      )}

      <div style={{
        fontSize: 11, fontWeight: 700, color: C.textMid, marginBottom: 8,
        textTransform: "uppercase", letterSpacing: 1.5,
      }}>
        ↕ Drag blocks into the right order
      </div>

      <div style={{ animation: shakeWrong ? "shakeX 0.5s ease" : "none" }}>
        <DraggableBlocks blocks={shuffled} onReorder={handleReorder} />
      </div>

      {attempts > 0 && !checking && (
        <div style={{
          marginTop: 10, textAlign: "center", fontSize: 13,
          color: C.coral, fontWeight: 600, animation: "fadeUp 0.3s ease both",
        }}>
          Not quite — try rearranging! {attempts >= 2 ? "Use the hint!" : ""}
        </div>
      )}

      <button onClick={handleCheck} disabled={checking} style={{
        width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
        background: checking ? C.textDim : `linear-gradient(135deg, ${C.nylBlue}, ${C.nylDark})`,
        color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer",
        marginTop: 16, boxShadow: "0 4px 20px rgba(0,115,189,0.3)",
      }}>
        {checking ? "Checking..." : "Check My Code ✓"}
      </button>
    </div>
  );
}

// ─── REVIEW LEVEL ──────────────────────────────────────────────────────────────
function ReviewLevel({ level, onComplete }) {
  const [selected, setSelected] = useState(null);
  const [wrongGuesses, setWrongGuesses] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [foundBug, setFoundBug] = useState(false);

  function handleTap(line) {
    if (foundBug) return;
    if (line.hasBug) {
      setSelected(line.id);
      setFoundBug(true);
      // Transition to debrief after a moment
      setTimeout(() => onComplete(line), 1200);
    } else {
      setWrongGuesses(prev => [...prev, line.id]);
      setSelected(line.id);
      setTimeout(() => setSelected(null), 800);
    }
  }

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <div style={{
        background: "#F3EEFF",
        border: "1px solid #D8CCFA",
        borderRadius: 12, padding: "12px 14px", marginBottom: 12,
      }}>
        <p style={{ color: C.textBright, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{level.description}</p>
      </div>

      {showHint && !foundBug && (
        <div style={{
          background: "#FFF8E8", border: "1px solid #FDE68A",
          borderRadius: 10, padding: "10px 14px", marginBottom: 12,
          fontSize: 13, color: C.orange, animation: "fadeUp 0.3s ease both",
        }}>
          💡 {level.hint}
        </div>
      )}
      {!showHint && !foundBug && (
        <button onClick={() => setShowHint(true)} style={{
          background: "none", border: "none", color: C.sky, fontSize: 13,
          cursor: "pointer", padding: 0, marginBottom: 12, textDecoration: "underline",
        }}>Need a hint?</button>
      )}

      <div style={{
        fontSize: 11, fontWeight: 700, color: C.textMid, marginBottom: 8,
        textTransform: "uppercase", letterSpacing: 1.5,
      }}>
        👆 Tap the line with the problem
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {level.codeLines.map((line, idx) => {
          const isSelected = selected === line.id;
          const isFound = foundBug && line.hasBug;
          const wasWrong = wrongGuesses.includes(line.id);

          let bg = C.codeBg;
          let borderColor = "transparent";
          let textColor = C.codeText;
          let extraStyle = { boxShadow: "0 2px 8px rgba(0,56,94,0.1)" };

          if (isFound) {
            // CORRECT — green glow
            bg = "#064E3B";
            borderColor = C.green;
            textColor = "#86EFAC";
            extraStyle = { animation: "glowPulse 1.5s ease infinite" };
          } else if (isSelected && !line.hasBug) {
            // WRONG — red shake
            bg = "#7F1D1D";
            borderColor = C.red;
            textColor = "#FCA5A5";
            extraStyle = { animation: "shakeX 0.5s ease" };
          }

          return (
            <div
              key={line.id}
              onClick={() => handleTap(line)}
              style={{
                fontFamily: monoFont, fontSize: 12, lineHeight: 1.6,
                padding: "12px 14px", borderRadius: 10,
                background: bg, border: `2px solid ${borderColor}`,
                color: textColor,
                cursor: foundBug ? "default" : "pointer",
                whiteSpace: "pre-wrap", wordBreak: "break-word",
                transition: "all 0.3s ease",
                userSelect: "none", WebkitUserSelect: "none",
                animation: (!isSelected && !isFound) ? `dropIn 0.25s ease ${idx * 0.05}s both` : undefined,
                ...extraStyle,
              }}
            >
              {line.code}
            </div>
          );
        })}
      </div>

      {wrongGuesses.length > 0 && !foundBug && !selected && (
        <div style={{
          marginTop: 10, textAlign: "center", fontSize: 13,
          color: C.coral, fontWeight: 600, animation: "fadeUp 0.3s ease both",
        }}>
          That line looks fine — keep looking! {wrongGuesses.length >= 2 ? "Try the hint!" : ""}
        </div>
      )}

      {foundBug && (
        <div style={{
          marginTop: 12, textAlign: "center", fontSize: 15,
          color: C.green, fontWeight: 700, animation: "scaleIn 0.3s ease both",
        }}>
          ✅ Found it! Loading debrief...
        </div>
      )}
    </div>
  );
}

// ─── DEBRIEF SCREEN ────────────────────────────────────────────────────────────
function DebriefScreen({ level, bugLine, onNext, isLast }) {
  const d = level.debrief;
  const confettiColors = [C.green, C.nylBlue, C.orange, C.purple, C.coral, C.sky];

  return (
    <div style={{
      padding: "32px 20px", textAlign: "center",
      animation: "fadeUp 0.5s ease both",
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}>
      {/* Confetti burst */}
      <div style={{ position: "relative", width: 80, height: 80, marginBottom: 8 }}>
        <div style={{ fontSize: 52, animation: "scaleIn 0.4s ease both", position: "relative", zIndex: 1 }}>{d.emoji}</div>
        {confettiColors.map((color, i) => (
          <div key={i} style={{
            position: "absolute", top: "50%", left: "50%",
            width: 8, height: 8, borderRadius: i % 2 === 0 ? 2 : "50%",
            background: color,
            animation: `confetti${(i % 6) + 1} 0.8s ease 0.2s both`,
          }} />
        ))}
      </div>

      <h2 style={{
        fontFamily: font, fontSize: 24, fontWeight: 800,
        color: C.textBright, marginBottom: 8, animation: "fadeUp 0.4s ease 0.2s both",
      }}>
        {d.title}
      </h2>

      <p style={{
        fontSize: 15, color: C.textBright, lineHeight: 1.7,
        maxWidth: 340, marginBottom: 16, animation: "fadeUp 0.4s ease 0.3s both",
      }}>
        {d.message}
      </p>

      {/* Bug explanation for review levels */}
      {bugLine && (
        <div style={{
          background: "#F5F3FF",
          border: "1px solid #D8CCFA",
          borderRadius: 14, padding: 16, maxWidth: 360, marginBottom: 16,
          textAlign: "left", animation: "fadeUp 0.4s ease 0.4s both",
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: C.purple,
            textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8,
          }}>The problematic code</div>
          <pre style={{
            fontFamily: monoFont, fontSize: 11, color: "#FCA5A5",
            margin: "0 0 10px", whiteSpace: "pre-wrap", wordBreak: "break-word",
            background: C.codeBg, borderRadius: 8, padding: "8px 10px",
          }}>{bugLine.code}</pre>
          <p style={{ fontSize: 13, color: C.textBright, lineHeight: 1.6, margin: 0 }}>
            {bugLine.bugExplanation}
          </p>
        </div>
      )}

      <button onClick={onNext} style={{
        background: `linear-gradient(135deg, ${C.nylBlue}, ${C.nylDark})`,
        color: "#fff", border: "none", borderRadius: 50,
        padding: "16px 52px", fontSize: 17, fontWeight: 700,
        cursor: "pointer", boxShadow: "0 4px 24px rgba(0,115,189,0.35)",
        animation: "fadeUp 0.4s ease 0.6s both",
      }}>
        {isLast ? "See Results →" : "Next Level →"}
      </button>
    </div>
  );
}

// ─── INTRO SCREEN ──────────────────────────────────────────────────────────────
function IntroScreen({ onStart }) {
  const steps = [
    { emoji: "🛠️", label: "Build: Collect Applicant Info", delay: "0.7s" },
    { emoji: "🤖", label: "AI Review: Spot the Hallucination", delay: "0.85s" },
    { emoji: "🛠️", label: "Build: Calculate & Submit", delay: "1.0s" },
    { emoji: "🤖", label: "AI Review: Find the Security Hole", delay: "1.15s" },
  ];

  return (
    <div style={{
      textAlign: "center", padding: "40px 20px", minHeight: "100vh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* Floating particles */}
      {[
        { color: C.nylBlue, size: 8, top: "10%", left: "15%", dur: "3s" },
        { color: C.green, size: 6, top: "20%", right: "10%", dur: "4s" },
        { color: C.purple, size: 10, top: "70%", left: "8%", dur: "3.5s" },
        { color: C.orange, size: 7, top: "80%", right: "15%", dur: "4.5s" },
        { color: C.coral, size: 5, top: "45%", left: "85%", dur: "3.2s" },
      ].map((p, i) => (
        <div key={i} style={{
          position: "absolute", width: p.size, height: p.size,
          borderRadius: "50%", background: p.color, opacity: 0.2,
          top: p.top, left: p.left, right: p.right,
          animation: `float ${p.dur} ease-in-out infinite`,
        }} />
      ))}

      <div style={{ animation: "scaleIn 0.5s ease both", fontSize: 52, marginBottom: 12 }}>
        <span style={{ display: "inline-block", animation: "float 2.5s ease-in-out infinite" }}>💻</span>
      </div>

      <div style={{
        display: "inline-block", background: C.nylBlue, color: "#fff",
        fontWeight: 800, fontSize: 10, padding: "5px 14px", borderRadius: 20,
        letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16,
        animation: "fadeUp 0.4s ease 0.2s both",
      }}>
        NYL × Girls Who Code
      </div>

      <h1 style={{
        fontFamily: font, fontSize: 28, fontWeight: 800,
        color: C.textBright, lineHeight: 1.2, marginBottom: 12,
        animation: "fadeUp 0.5s ease 0.4s both",
      }}>
        A Day in the Life of a{" "}
        <span style={{ color: C.nylBlue }}>Software Engineer</span>
      </h1>

      <p style={{
        animation: "fadeUp 0.5s ease 0.6s both",
        fontSize: 14, color: C.textMid, maxWidth: 320, lineHeight: 1.7, marginBottom: 24,
      }}>
        Build a real feature. Catch AI hallucinations. Find security holes. This is what we do every day at New York Life.
      </p>

      <div style={{
        display: "flex", flexDirection: "column", gap: 8,
        maxWidth: 320, width: "100%", marginBottom: 28,
      }}>
        {steps.map((s, i) => (
          <div key={i} style={{
            animation: `slideInLeft 0.5s ease ${s.delay} both`,
            display: "flex", alignItems: "center", gap: 12,
            background: "#FFFFFF",
            border: "1px solid #D1E3F0",
            borderRadius: 12, padding: "10px 14px",
            boxShadow: "0 1px 3px rgba(0,56,94,0.06)",
          }}>
            <span style={{ fontSize: 20 }}>{s.emoji}</span>
            <span style={{ fontSize: 13, color: C.textBright, fontWeight: 500 }}>{s.label}</span>
            <div style={{
              marginLeft: "auto", width: 22, height: 22, borderRadius: 11,
              border: "2px solid #D1E3F0",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 10, color: C.textDim, fontWeight: 700 }}>{i + 1}</span>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onStart} style={{
        background: `linear-gradient(135deg, ${C.nylBlue}, ${C.nylDark})`,
        color: "white", border: "none", borderRadius: 50,
        padding: "16px 52px", fontSize: 17, fontWeight: 700,
        cursor: "pointer", boxShadow: "0 4px 24px rgba(0,115,189,0.35)",
        animationName: "fadeUp, pulseBtn",
        animationDuration: "0.5s, 2s",
        animationDelay: "1.3s, 2s",
        animationTimingFunction: "ease, ease",
        animationFillMode: "both, none",
        animationIterationCount: "1, infinite",
      }}>
        Start the Journey →
      </button>
    </div>
  );
}

// ─── COMPLETE SCREEN ───────────────────────────────────────────────────────────
function CompleteScreen({ onRestart }) {
  const items = [
    { icon: "📝", text: "Collected and validated user data" },
    { icon: "🤖", text: "Caught an AI hallucination" },
    { icon: "🔗", text: "Connected frontend to backend APIs" },
    { icon: "🔒", text: "Found a real security vulnerability" },
  ];

  return (
    <div style={{
      textAlign: "center", padding: "40px 20px", minHeight: "100vh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ fontSize: 56, marginBottom: 12, animation: "scaleIn 0.5s ease both" }}>🎉</div>

      <h1 style={{
        fontFamily: font, fontSize: 26, fontWeight: 800,
        color: C.textBright, lineHeight: 1.2, marginBottom: 12,
        animation: "fadeUp 0.4s ease 0.2s both",
      }}>
        Workshop Complete!
      </h1>

      <p style={{
        color: C.textMid, fontSize: 14, lineHeight: 1.6,
        maxWidth: 340, marginBottom: 20, animation: "fadeUp 0.4s ease 0.3s both",
      }}>
        You just experienced what software engineers at New York Life do every day:
      </p>

      <div style={{
        display: "flex", flexDirection: "column", gap: 8,
        maxWidth: 340, width: "100%", marginBottom: 24,
      }}>
        {items.map((item, i) => (
          <div key={i} style={{
            animation: `slideInLeft 0.4s ease ${0.4 + i * 0.1}s both`,
            display: "flex", alignItems: "center", gap: 12,
            background: "#FFFFFF",
            border: "1px solid #D1E3F0",
            borderRadius: 10, padding: "10px 14px", textAlign: "left",
            boxShadow: "0 1px 3px rgba(0,56,94,0.06)",
          }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 14, color: C.textBright, fontWeight: 500 }}>{item.text}</span>
          </div>
        ))}
      </div>

      <div style={{
        background: "#E8F4FD",
        border: `1px solid #B8DCEF`,
        borderRadius: 14, padding: 18, maxWidth: 340,
        marginBottom: 24, animation: "fadeUp 0.4s ease 0.8s both",
      }}>
        <p style={{ color: C.textBright, fontSize: 14, fontWeight: 600, margin: 0, lineHeight: 1.6 }}>
          "AI is a powerful tool, but engineers are the ones who make it work safely and correctly."
        </p>
        <p style={{ color: C.textDim, fontSize: 12, margin: "8px 0 0" }}>
          — Your NYL Software Engineering Team
        </p>
      </div>

      <button onClick={onRestart} style={{
        padding: "12px 32px", borderRadius: 12,
        border: `2px solid ${C.nylBlue}`, background: "transparent",
        color: C.nylBlue, fontWeight: 700, fontSize: 15, cursor: "pointer",
        animation: "fadeUp 0.4s ease 0.9s both",
      }}>
        Play Again
      </button>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("intro");
  const [currentLevel, setCurrentLevel] = useState(0);
  const [bugLine, setBugLine] = useState(null);

  useEffect(() => { injectCSS(); }, []);

  function handleStart() {
    setScreen("playing");
    setCurrentLevel(0);
  }

  function handleLevelComplete(foundBugLine) {
    if (foundBugLine && foundBugLine.hasBug) {
      setBugLine(foundBugLine);
    } else {
      setBugLine(null);
    }
    setScreen("debrief");
  }

  function handleNextLevel() {
    if (currentLevel >= levels.length - 1) {
      setScreen("complete");
    } else {
      setCurrentLevel(c => c + 1);
      setScreen("playing");
      setBugLine(null);
    }
  }

  function handleRestart() {
    setScreen("intro");
    setCurrentLevel(0);
    setBugLine(null);
  }

  const level = levels[currentLevel];

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      fontFamily: font,
      maxWidth: 480,
      margin: "0 auto",
      color: C.textBright,
    }}>
      {screen === "intro" && <IntroScreen onStart={handleStart} />}

      {screen === "playing" && (
        <div style={{ padding: "20px 16px" }}>
          <ProgressBar current={currentLevel} total={levels.length} />

          <div style={{ marginBottom: 14 }}>
            <div style={{
              display: "inline-block",
              background: level.type === "build" ? "#E8F4FD" : "#F3EEFF",
              color: level.type === "build" ? C.nylBlue : C.purple,
              fontSize: 11, fontWeight: 700, padding: "4px 12px",
              borderRadius: 20, marginBottom: 8,
            }}>
              {level.subtitle}
            </div>
            <h2 style={{
              fontFamily: font, fontSize: 22, fontWeight: 800,
              color: C.textBright, margin: 0,
            }}>
              {level.icon} {level.title}
            </h2>
          </div>

          {level.type === "build" ? (
            <BuildLevel key={level.id} level={level} onComplete={() => handleLevelComplete(null)} />
          ) : (
            <ReviewLevel key={level.id} level={level} onComplete={(line) => handleLevelComplete(line)} />
          )}
        </div>
      )}

      {screen === "debrief" && (
        <DebriefScreen
          level={level}
          bugLine={bugLine}
          onNext={handleNextLevel}
          isLast={currentLevel >= levels.length - 1}
        />
      )}

      {screen === "complete" && <CompleteScreen onRestart={handleRestart} />}
    </div>
  );
}
