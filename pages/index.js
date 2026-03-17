import { useState, useEffect, useRef } from "react";

const STEPS_META = [
  { id: 1, label: "Proces" },
  { id: 2, label: "Definicja" },
  { id: 3, label: "Projekt" },
  { id: 4, label: "Dane" },
  { id: 5, label: "Właściciel" },
  { id: 6, label: "Ryzyko" },
  { id: 7, label: "Plan B" },
  { id: 8, label: "Ocena" },
];

// ← JEDYNA ZMIANA vs artefakt: wywołuje /api/claude zamiast api.anthropic.com
async function callLLM(systemPrompt, userPrompt) {
  try {
    const response = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system: systemPrompt, userMessage: userPrompt }),
    });
    const data = await response.json();
    return data.text || null;
  } catch (e) {
    return null;
  }
}

function isLowEffort(text) {
  if (!text || text.trim().length < 5) return true;
  const low = /^(test|asdf|xxx|aaa|bbb|nie wiem|nic|coś|cokolwiek|blabla|hej|elo|siema|tak|nie|ok|dupa|xd|haha|lol)$/i;
  return low.test(text.trim());
}

function ProgressBar({ currentStep }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, margin: "0 auto 36px", maxWidth: 620 }}>
      {STEPS_META.map((s, i) => {
        const done = currentStep > s.id;
        const active = currentStep === s.id;
        return (
          <div key={s.id} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 36 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 13, fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                background: done ? "#22c55e" : active ? "#f59e0b" : "rgba(255,255,255,0.08)",
                color: done || active ? "#0a0a0f" : "rgba(255,255,255,0.35)",
                border: active ? "2px solid #f59e0b" : "2px solid transparent",
                transition: "all 0.4s ease",
              }}>
                {done ? "✓" : s.id}
              </div>
              <span style={{
                fontSize: 9, marginTop: 4,
                color: active ? "#f59e0b" : done ? "#22c55e" : "rgba(255,255,255,0.3)",
                fontWeight: active ? 700 : 400,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.05em", textTransform: "uppercase",
              }}>
                {s.label}
              </span>
            </div>
            {i < STEPS_META.length - 1 && (
              <div style={{
                flex: 1, height: 2,
                background: done ? "#22c55e" : "rgba(255,255,255,0.08)",
                margin: "0 2px", marginBottom: 18, transition: "background 0.4s ease",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function LoadingDots() {
  const [dots, setDots] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d % 3) + 1), 500);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{
        width: 56, height: 56, margin: "0 auto 24px",
        border: "3px solid rgba(245,158,11,0.2)", borderTopColor: "#f59e0b",
        borderRadius: "50%", animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: "#f59e0b", fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>
        Analizuję odpowiedź{".".repeat(dots)}
      </p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentInput, setCurrentInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState({});
  const [finalResult, setFinalResult] = useState(null);
  const [error, setError] = useState("");
  const [lowEffortWarning, setLowEffortWarning] = useState(false);
  const textRef = useRef(null);

  const reset = () => {
    setStep(0); setAnswers({}); setCurrentInput(""); setLoading(false);
    setGeneratedQuestions({}); setFinalResult(null); setError(""); setLowEffortWarning(false);
  };

  const buildCtx = (ans) => {
    const map = {
      1: "PROCES DO AUTOMATYZACJI", 2: "JASNOŚĆ DEFINICJI PROBLEMU",
      3: "PROJEKTOWANIE PROCESU BIZNESOWEGO", 4: "JAKOŚĆ DANYCH",
      5: "WŁAŚCICIEL PROCESU", 6: "IDENTYFIKACJA RYZYK", 7: "PLAN AWARYJNY",
    };
    return Object.entries(ans).map(([k, v]) => `${map[k]}: ${v}`).join("\n\n");
  };

  const PROMPTS = {
    2: `Jesteś ekspertem od wdrożeń AI w biznesie. Prowadzisz warsztat "Błędy adopcji AI w biznesie". Uczestnik opisał proces, który chce zautomatyzować z AI. Zadaj JEDNO konkretne pytanie sprawdzające, czy problem jest jasno zdefiniowany. Pytanie powinno być krótkie (1-2 zdania), nawiązywać bezpośrednio do tego, co napisał uczestnik. Odpowiedz TYLKO pytaniem. Po pytaniu dodaj w nowej linii krótką wskazówkę zaczynającą się od "💡 Wskazówka:". Pisz po polsku.`,
    3: `Jesteś ekspertem od wdrożeń AI w biznesie. Zadaj JEDNO pytanie sprawdzające, czy podejście uczestnika to przemyślany projekt, czy raczej "AI dla AI". Nawiąż do konkretnego procesu. Odpowiedz TYLKO pytaniem. Po pytaniu dodaj "💡 Wskazówka:". Pisz po polsku.`,
    4: `Jesteś ekspertem od wdrożeń AI w biznesie. Zadaj JEDNO pytanie o jakość danych w kontekście tego procesu. Po pytaniu dodaj 2-3 zdania wyjaśnienia czym są "wystarczająco dobre dane" dla tego procesu. Pisz po polsku.`,
    5: `Jesteś ekspertem od wdrożeń AI w biznesie. Zadaj JEDNO pytanie o właściciela procesu. Nawiąż do procesu uczestnika. Odpowiedz TYLKO pytaniem. Po pytaniu dodaj "💡 Wskazówka:". Pisz po polsku.`,
    6: `Jesteś ekspertem od wdrożeń AI w biznesie. Zadaj JEDNO pytanie o to, gdzie AI może się mylić w tym procesie. Odpowiedz TYLKO pytaniem. Po pytaniu dodaj "💡 Wskazówka:". Pisz po polsku.`,
    7: `Jesteś ekspertem od wdrożeń AI w biznesie. Zadaj JEDNO pytanie o plan awaryjny — co gdy AI się pomyli? Nawiąż do wskazanych ryzyk. Odpowiedz TYLKO pytaniem. Po pytaniu dodaj "💡 Wskazówka:". Pisz po polsku.`,
  };

  const generateQuestion = async (targetStep, ans) => {
    setLoading(true);
    setStep(targetStep);
    setError("");
    const result = await callLLM(PROMPTS[targetStep], buildCtx(ans));
    if (result) setGeneratedQuestions((prev) => ({ ...prev, [targetStep]: result }));
    else setError("Nie udało się wygenerować pytania. Spróbuj ponownie.");
    setLoading(false);
  };

  const generateFinal = async (ans) => {
    setLoading(true);
    setError("");
    const system = `Jesteś ekspertem od wdrożeń AI w biznesie. Oceń gotowość procesu uczestnika do wdrożenia AI na podstawie jego odpowiedzi. Odpowiedz TYLKO w formacie JSON (bez markdown, bez backtickow): {"score":<0-100>,"comment":"<5 zdań>","strengths":["<s1>","<s2>"],"risks":["<r1>","<r2>"],"nextStep":"<zalecenie>"}. Pisz po polsku.`;
    const result = await callLLM(system, buildCtx(ans));
    if (result) {
      try {
        const cleaned = result.replace(/```json\s*/g, "").replace(/```/g, "").trim();
        setFinalResult(JSON.parse(cleaned));
      } catch { setError("Błąd analizy wyników. Spróbuj ponownie."); }
    } else { setError("Nie udało się wygenerować oceny. Spróbuj ponownie."); }
    setLoading(false);
  };

  const handleNext = async () => {
    const trimmed = currentInput.trim();
    if (!trimmed) { setError("Proszę wpisać odpowiedź przed przejściem dalej."); return; }
    if (isLowEffort(trimmed)) {
      setLowEffortWarning(true);
      setError("Twoja odpowiedź jest zbyt krótka lub ogólnikowa. Opisz konkretny proces biznesowy.");
      return;
    }
    setLowEffortWarning(false); setError("");
    const newAnswers = { ...answers, [step]: trimmed };
    setAnswers(newAnswers);
    setCurrentInput("");
    if (step < 7) { await generateQuestion(step + 1, newAnswers); }
    else { setStep(8); await generateFinal(newAnswers); }
  };

  const downloadReport = () => {
    if (!finalResult) return;
    const now = new Date().toLocaleDateString("pl-PL");
    const report = `AI READINESS CHECK — RAPORT\nData: ${now}\nAutor: Maciej Broniszewski · dfe.academy\n\nWYNIK: ${finalResult.score}/100\n\n--- ODPOWIEDZI ---\n${Object.entries(answers).map(([k, v]) => `${k}. ${v}`).join("\n\n")}\n\n--- OCENA ---\n${finalResult.comment}\n\nMOCNE STRONY:\n${finalResult.strengths?.map(s => `✓ ${s}`).join("\n")}\n\nRYZYKA:\n${finalResult.risks?.map(r => `⚠ ${r}`).join("\n")}\n\nNASTĘPNY KROK:\n→ ${finalResult.nextStep}`;
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `AI_Readiness_${now.replace(/\./g, "-")}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const scoreColor = (s) => s >= 75 ? "#22c55e" : s >= 50 ? "#f59e0b" : s >= 25 ? "#f97316" : "#ef4444";
  const scoreLabel = (s) => s >= 75 ? "Wysoka gotowość" : s >= 50 ? "Umiarkowana gotowość" : s >= 25 ? "Niska gotowość" : "Wymaga przygotowania";

  const stepTitles = { 1: "Zdefiniuj proces", 2: "Jasność definicji", 3: "Projekt procesu", 4: "Jakość danych", 5: "Właściciel procesu", 6: "Identyfikacja ryzyk", 7: "Plan awaryjny" };
  const stepIcons = { 1: "🎯", 2: "🔍", 3: "⚙️", 4: "📊", 5: "👤", 6: "⚠️", 7: "🛡️" };

  if (step === 0) return (
    <div style={S.container}>
      <div style={S.innerWrap}>
        <div style={S.introCard}>
          <div style={S.badge}>WARSZTAT INTERAKTYWNY</div>
          <h1 style={S.mainTitle}><span style={{ color: "#f59e0b" }}>AI</span> READINESS CHECK</h1>
          <p style={S.subtitle}>Błędy adopcji sztucznej inteligencji w biznesie</p>
          <div style={S.divider} />
          <p style={S.introText}>Sprawdź, czy Twój proces biznesowy jest gotowy na wdrożenie AI. Odpowiedz na 7 pytań — zajmie Ci to około 7 minut. Na końcu otrzymasz spersonalizowaną ocenę gotowości.</p>
          <button style={S.primaryBtn} onClick={() => setStep(1)}>Rozpocznij sprawdzanie →</button>
          <p style={S.authorLine}>Prowadzący: <strong>Maciej Broniszewski</strong> · dfe.academy</p>
        </div>
      </div>
    </div>
  );

  if (step === 8) return (
    <div style={S.container}>
      <div style={S.innerWrap}>
        <div style={S.headerBar}>
          <span style={S.headerTitle}><span style={{ color: "#f59e0b" }}>AI</span> READINESS CHECK</span>
          <button style={S.resetBtn} onClick={reset}>↺ Nowa sesja</button>
        </div>
        <ProgressBar currentStep={8} />
        {loading ? <LoadingDots /> : finalResult ? (
          <div style={S.resultCard}>
            <div style={S.badge}>WYNIK ANALIZY</div>
            <div style={S.scoreCircleWrap}>
              <svg width="180" height="180" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                <circle cx="90" cy="90" r="80" fill="none" stroke={scoreColor(finalResult.score)} strokeWidth="10"
                  strokeDasharray={`${(finalResult.score / 100) * 502.6} 502.6`} strokeLinecap="round"
                  transform="rotate(-90 90 90)" style={{ transition: "stroke-dasharray 1.5s ease" }} />
              </svg>
              <div style={S.scoreInner}>
                <span style={{ ...S.scoreNum, color: scoreColor(finalResult.score) }}>{finalResult.score}</span>
                <span style={S.scoreMax}>/100</span>
              </div>
            </div>
            <p style={{ ...S.scoreLabel, color: scoreColor(finalResult.score) }}>{scoreLabel(finalResult.score)}</p>
            <div style={S.commentBox}><p style={S.commentText}>{finalResult.comment}</p></div>
            <div style={S.twoCol}>
              <div style={S.colCard}>
                <h3 style={{ ...S.colTitle, color: "#22c55e" }}>✓ Mocne strony</h3>
                {finalResult.strengths?.map((s, i) => <p key={i} style={S.colItem}>{s}</p>)}
              </div>
              <div style={S.colCard}>
                <h3 style={{ ...S.colTitle, color: "#f97316" }}>⚠ Ryzyka</h3>
                {finalResult.risks?.map((r, i) => <p key={i} style={S.colItem}>{r}</p>)}
              </div>
            </div>
            <div style={S.nextStepBox}>
              <h3 style={S.nextStepTitle}>→ Następny krok</h3>
              <p style={S.nextStepText}>{finalResult.nextStep}</p>
            </div>
            <button style={S.primaryBtn} onClick={downloadReport}>⬇ Pobierz raport (TXT)</button>
            <p style={S.authorLine}>Narzędzie: <strong>Maciej Broniszewski</strong> · dfe.academy</p>
          </div>
        ) : error ? (
          <div style={S.card}>
            <p style={S.errorText}>{error}</p>
            <button style={S.primaryBtn} onClick={() => generateFinal(answers)}>Spróbuj ponownie</button>
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <div style={S.container}>
      <div style={S.innerWrap}>
        <div style={S.headerBar}>
          <span style={S.headerTitle}><span style={{ color: "#f59e0b" }}>AI</span> READINESS CHECK</span>
          <button style={S.resetBtn} onClick={reset}>↺ Nowa sesja</button>
        </div>
        <ProgressBar currentStep={step} />
        {loading ? <LoadingDots /> : (
          <div style={S.card}>
            <div style={S.stepHeader}>
              <span style={S.stepIcon}>{stepIcons[step]}</span>
              <div>
                <div style={S.stepLabel}>Krok {step} z 7</div>
                <h2 style={S.stepTitle}>{stepTitles[step]}</h2>
              </div>
            </div>
            {step === 1 ? (
              <div>
                <p style={S.questionText}>Opisz proces biznesowy, który chciałbyś zautomatyzować lub usprawnić z pomocą sztucznej inteligencji.</p>
                <p style={S.hintText}>Napisz krótko — wystarczą 1–3 zdania. Podaj konkretny proces, np. „automatyczna klasyfikacja faktur kosztowych".</p>
              </div>
            ) : (
              <div style={S.questionText}>
                {generatedQuestions[step]?.split("\n").map((line, i) => (
                  <p key={i} style={line.startsWith("💡") ? S.hintText : { margin: "0 0 12px" }}>{line}</p>
                ))}
              </div>
            )}
            <textarea ref={textRef} style={S.textarea}
              placeholder="Wpisz swoją odpowiedź tutaj..."
              value={currentInput}
              onChange={(e) => { setCurrentInput(e.target.value); setError(""); setLowEffortWarning(false); }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleNext(); } }}
              rows={4}
            />
            {error && (
              <div style={S.errorBox}>
                <p style={S.errorText}>{error}</p>
                {lowEffortWarning && <button style={S.resetSmallBtn} onClick={reset}>↺ Zacznij od nowa</button>}
              </div>
            )}
            <div style={S.btnRow}>
              <span style={S.timerHint}>⏱ ~1 min</span>
              <button style={S.primaryBtn} onClick={handleNext}>{step === 7 ? "Pokaż wynik →" : "Dalej →"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  container: { minHeight: "100vh", background: "linear-gradient(170deg, #0a0a0f 0%, #12121f 40%, #0d0d18 100%)", color: "#e8e8ed", fontFamily: "'Crimson Pro', 'Georgia', serif", padding: "20px 16px" },
  innerWrap: { maxWidth: 680, margin: "0 auto" },
  headerBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)" },
  headerTitle: { fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, letterSpacing: "0.08em" },
  resetBtn: { background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", cursor: "pointer" },
  introCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "48px 36px", textAlign: "center" },
  badge: { display: "inline-block", background: "rgba(245,158,11,0.12)", color: "#f59e0b", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", padding: "6px 16px", borderRadius: 100, marginBottom: 24, border: "1px solid rgba(245,158,11,0.2)" },
  mainTitle: { fontSize: 42, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.02em", margin: "0 0 8px", lineHeight: 1.1 },
  subtitle: { fontSize: 17, color: "rgba(255,255,255,0.5)", margin: "0 0 24px", fontStyle: "italic" },
  divider: { width: 60, height: 2, background: "linear-gradient(90deg, transparent, #f59e0b, transparent)", margin: "0 auto 24px" },
  introText: { fontSize: 16, lineHeight: 1.7, color: "rgba(255,255,255,0.65)", maxWidth: 480, margin: "0 auto 32px" },
  primaryBtn: { background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#0a0a0f", border: "none", borderRadius: 10, padding: "14px 32px", fontSize: 15, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", cursor: "pointer" },
  authorLine: { marginTop: 28, fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "32px 28px" },
  stepHeader: { display: "flex", alignItems: "center", gap: 16, marginBottom: 24 },
  stepIcon: { fontSize: 36, width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(245,158,11,0.08)", borderRadius: 14, border: "1px solid rgba(245,158,11,0.15)", flexShrink: 0 },
  stepLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#f59e0b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 },
  stepTitle: { fontSize: 22, fontWeight: 700, margin: 0, fontFamily: "'JetBrains Mono', monospace" },
  questionText: { fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,0.82)", marginBottom: 20 },
  hintText: { fontSize: 14, color: "rgba(245,158,11,0.7)", lineHeight: 1.6, margin: "8px 0 0", padding: "10px 14px", background: "rgba(245,158,11,0.06)", borderRadius: 8, borderLeft: "3px solid rgba(245,158,11,0.3)" },
  textarea: { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "14px 16px", fontSize: 15, color: "#e8e8ed", fontFamily: "'Crimson Pro', Georgia, serif", lineHeight: 1.6, resize: "vertical", outline: "none", marginBottom: 16, boxSizing: "border-box" },
  errorBox: { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 },
  errorText: { color: "#f87171", fontSize: 14, margin: 0 },
  resetSmallBtn: { background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", cursor: "pointer" },
  btnRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  timerHint: { fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" },
  resultCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "40px 32px", textAlign: "center" },
  scoreCircleWrap: { position: "relative", width: 180, height: 180, margin: "24px auto 12px", display: "flex", alignItems: "center", justifyContent: "center" },
  scoreInner: { position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" },
  scoreNum: { fontSize: 52, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 },
  scoreMax: { fontSize: 16, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" },
  scoreLabel: { fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 28 },
  commentBox: { background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "20px 24px", marginBottom: 24, textAlign: "left", borderLeft: "3px solid rgba(245,158,11,0.4)" },
  commentText: { fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.75)", margin: 0 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20, textAlign: "left" },
  colCard: { background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "16px 18px", border: "1px solid rgba(255,255,255,0.06)" },
  colTitle: { fontSize: 14, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, marginBottom: 10, marginTop: 0 },
  colItem: { fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, margin: "0 0 8px" },
  nextStepBox: { background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 12, padding: "18px 22px", marginBottom: 28, textAlign: "left" },
  nextStepTitle: { fontSize: 14, fontFamily: "'JetBrains Mono', monospace", color: "#22c55e", fontWeight: 700, margin: "0 0 8px" },
  nextStepText: { fontSize: 15, color: "rgba(255,255,255,0.72)", lineHeight: 1.6, margin: 0 },
};
