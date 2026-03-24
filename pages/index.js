import { useState, useEffect, useRef } from "react";

const T = {
  pl: {
    stepsLabels: ["Proces", "Definicja", "Projekt", "Dane", "Właściciel", "Ryzyko", "Plan B", "Ocena"],
    badge: "WARSZTAT INTERAKTYWNY",
    subtitle: "Błędy adopcji sztucznej inteligencji w biznesie",
    introText: "Sprawdź, czy Twój proces biznesowy jest gotowy na wdrożenie AI. Odpowiedz na 7 pytań — zajmie Ci to około 7 minut. Na końcu otrzymasz spersonalizowaną ocenę gotowości.",
    startBtn: "Rozpocznij sprawdzanie →",
    author: "Prowadzący:",
    newSession: "↺ Nowa sesja",
    analyzing: "Analizuję odpowiedź",
    stepOf: (n) => `Krok ${n} z 7`,
    stepTitles: { 1: "Zdefiniuj proces", 2: "Jasność definicji", 3: "Projekt procesu", 4: "Jakość danych", 5: "Właściciel procesu", 6: "Identyfikacja ryzyk", 7: "Plan awaryjny" },
    question1: "Opisz proces biznesowy, który chciałbyś zautomatyzować lub usprawnić z pomocą sztucznej inteligencji.",
    hint1: "Napisz krótko — wystarczą 1–3 zdania. Podaj konkretny proces, np. 'automatyczna klasyfikacja faktur kosztowych'.",
    placeholder: "Wpisz swoją odpowiedź tutaj...",
    nextBtn: "Dalej →",
    showResult: "Pokaż wynik →",
    timer: "⏱ ~1 min",
    errorEmpty: "Proszę wpisać odpowiedź przed przejściem dalej.",
    errorLowEffort: "Twoja odpowiedź jest zbyt krótka lub ogólnikowa. Opisz konkretny proces biznesowy.",
    errorGenQuestion: "Nie udało się wygenerować pytania. Spróbuj ponownie.",
    errorGenResult: "Nie udało się wygenerować oceny. Spróbuj ponownie.",
    errorParse: "Błąd analizy wyników. Spróbuj ponownie.",
    retry: "Spróbuj ponownie",
    startOver: "↺ Zacznij od nowa",
    resultBadge: "WYNIK ANALIZY",
    strengths: "✓ Mocne strony",
    risks: "⚠ Ryzyka",
    nextStep: "→ Następny krok",
    download: "⬇ Pobierz raport (TXT)",
    toolBy: "Narzędzie:",
    scoreLabels: { high: "Wysoka gotowość", moderate: "Umiarkowana gotowość", low: "Niska gotowość", none: "Wymaga przygotowania" },
    reportTitle: "AI READINESS CHECK — RAPORT",
    reportDate: "Data",
    reportAuthor: "Autor",
    reportScore: "WYNIK",
    reportAnswers: "--- ODPOWIEDZI ---",
    reportEval: "--- OCENA ---",
    reportStrengths: "MOCNE STRONY",
    reportRisks: "RYZYKA",
    reportNextStep: "NASTĘPNY KROK",
    selectLang: "Wybierz język / Select language",
    ctxLabels: { 1: "PROCES DO AUTOMATYZACJI", 2: "JASNOŚĆ DEFINICJI PROBLEMU", 3: "PROJEKTOWANIE PROCESU BIZNESOWEGO", 4: "JAKOŚĆ DANYCH", 5: "WŁAŚCICIEL PROCESU", 6: "IDENTYFIKACJA RYZYK", 7: "PLAN AWARYJNY" },
    prompts: {
      2: `Jesteś ekspertem od wdrożeń AI w biznesie. Prowadzisz warsztat "Błędy adopcji AI w biznesie". Uczestnik opisał proces, który chce zautomatyzować z AI. Zadaj JEDNO konkretne pytanie sprawdzające, czy problem jest jasno zdefiniowany. Pytanie powinno być krótkie (1-2 zdania), nawiązywać bezpośrednio do tego, co napisał uczestnik. Odpowiedz TYLKO pytaniem. Po pytaniu dodaj w nowej linii krótką wskazówkę zaczynającą się od "💡 Wskazówka:". Pisz po polsku.`,
      3: `Jesteś ekspertem od wdrożeń AI w biznesie. Zadaj JEDNO pytanie sprawdzające, czy podejście uczestnika to przemyślany projekt, czy raczej "AI dla AI". Nawiąż do konkretnego procesu. Odpowiedz TYLKO pytaniem. Po pytaniu dodaj "💡 Wskazówka:". Pisz po polsku.`,
      4: `Jesteś ekspertem od wdrożeń AI w biznesie. Zadaj JEDNO pytanie o jakość danych w kontekście tego procesu. Po pytaniu dodaj 2-3 zdania wyjaśnienia czym są "wystarczająco dobre dane" dla tego procesu. Pisz po polsku.`,
      5: `Jesteś ekspertem od wdrożeń AI w biznesie. Zadaj JEDNO pytanie o właściciela procesu. Nawiąż do procesu uczestnika. Odpowiedz TYLKO pytaniem. Po pytaniu dodaj "💡 Wskazówka:". Pisz po polsku.`,
      6: `Jesteś ekspertem od wdrożeń AI w biznesie. Zadaj JEDNO pytanie o to, gdzie AI może się mylić w tym procesie. Odpowiedz TYLKO pytaniem. Po pytaniu dodaj "💡 Wskazówka:". Pisz po polsku.`,
      7: `Jesteś ekspertem od wdrożeń AI w biznesie. Zadaj JEDNO pytanie o plan awaryjny — co gdy AI się pomyli? Nawiąż do wskazanych ryzyk. Odpowiedz TYLKO pytaniem. Po pytaniu dodaj "💡 Wskazówka:". Pisz po polsku.`,
    },
    finalPrompt: `Jesteś ekspertem od wdrożeń AI w biznesie. Oceń gotowość procesu uczestnika do wdrożenia AI na podstawie jego odpowiedzi. Odpowiedz TYLKO w formacie JSON (bez markdown, bez backtickow): {"score":<0-100>,"comment":"<5 zdań>","strengths":["<s1>","<s2>"],"risks":["<r1>","<r2>"],"nextStep":"<zalecenie>"}. Pisz po polsku.`,
  },
  en: {
    stepsLabels: ["Process", "Definition", "Design", "Data", "Owner", "Risk", "Plan B", "Score"],
    badge: "INTERACTIVE WORKSHOP",
    subtitle: "AI adoption mistakes in business",
    introText: "Check if your business process is ready for AI implementation. Answer 7 questions — it will take about 7 minutes. At the end you will receive a personalized readiness assessment.",
    startBtn: "Start assessment →",
    author: "Facilitator:",
    newSession: "↺ New session",
    analyzing: "Analyzing response",
    stepOf: (n) => `Step ${n} of 7`,
    stepTitles: { 1: "Define the process", 2: "Problem clarity", 3: "Process design", 4: "Data quality", 5: "Process owner", 6: "Risk identification", 7: "Contingency plan" },
    question1: "Describe the business process you would like to automate or improve with artificial intelligence.",
    hint1: "Keep it short — 1–3 sentences are enough. Name a specific process, e.g. 'automatic classification of cost invoices'.",
    placeholder: "Type your answer here...",
    nextBtn: "Next →",
    showResult: "Show result →",
    timer: "⏱ ~1 min",
    errorEmpty: "Please enter an answer before proceeding.",
    errorLowEffort: "Your answer is too short or vague. Describe a specific business process.",
    errorGenQuestion: "Failed to generate a question. Please try again.",
    errorGenResult: "Failed to generate the assessment. Please try again.",
    errorParse: "Error parsing results. Please try again.",
    retry: "Try again",
    startOver: "↺ Start over",
    resultBadge: "ANALYSIS RESULT",
    strengths: "✓ Strengths",
    risks: "⚠ Risks",
    nextStep: "→ Next step",
    download: "⬇ Download report (TXT)",
    toolBy: "Tool:",
    scoreLabels: { high: "High readiness", moderate: "Moderate readiness", low: "Low readiness", none: "Needs preparation" },
    reportTitle: "AI READINESS CHECK — REPORT",
    reportDate: "Date",
    reportAuthor: "Author",
    reportScore: "SCORE",
    reportAnswers: "--- ANSWERS ---",
    reportEval: "--- ASSESSMENT ---",
    reportStrengths: "STRENGTHS",
    reportRisks: "RISKS",
    reportNextStep: "NEXT STEP",
    selectLang: "Wybierz język / Select language",
    ctxLabels: { 1: "PROCESS TO AUTOMATE", 2: "PROBLEM DEFINITION CLARITY", 3: "BUSINESS PROCESS DESIGN", 4: "DATA QUALITY", 5: "PROCESS OWNER", 6: "RISK IDENTIFICATION", 7: "CONTINGENCY PLAN" },
    prompts: {
      2: `You are an expert in AI implementation in business. You are running a workshop "AI adoption mistakes in business". The participant described a process they want to automate with AI. Ask ONE specific question to check whether the problem is clearly defined. The question should be short (1-2 sentences) and refer directly to what the participant wrote. Reply ONLY with the question. After the question, add a short hint on a new line starting with "💡 Hint:". Write in English.`,
      3: `You are an expert in AI implementation in business. Ask ONE question to check whether the participant's approach is a well-thought-out project or rather "AI for AI's sake". Refer to the specific process. Reply ONLY with the question. After the question, add "💡 Hint:". Write in English.`,
      4: `You are an expert in AI implementation in business. Ask ONE question about data quality in the context of this process. After the question, add 2-3 sentences explaining what "good enough data" means for this process. Write in English.`,
      5: `You are an expert in AI implementation in business. Ask ONE question about the process owner. Refer to the participant's process. Reply ONLY with the question. After the question, add "💡 Hint:". Write in English.`,
      6: `You are an expert in AI implementation in business. Ask ONE question about where AI might fail in this process. Reply ONLY with the question. After the question, add "💡 Hint:". Write in English.`,
      7: `You are an expert in AI implementation in business. Ask ONE question about the contingency plan — what if AI makes a mistake? Refer to the identified risks. Reply ONLY with the question. After the question, add "💡 Hint:". Write in English.`,
    },
    finalPrompt: `You are an expert in AI implementation in business. Assess the participant's process readiness for AI implementation based on their answers. Reply ONLY in JSON format (no markdown, no backticks): {"score":<0-100>,"comment":"<5 sentences>","strengths":["<s1>","<s2>"],"risks":["<r1>","<r2>"],"nextStep":"<recommendation>"}. Write in English.`,
  },
};

const STEP_ICONS = { 1: "🎯", 2: "🔍", 3: "⚙️", 4: "📊", 5: "👤", 6: "⚠️", 7: "🛡️" };

async function callLLM(systemPrompt, userPrompt) {
  try {
    const response = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system: systemPrompt, userMessage: userPrompt }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("API error:", response.status, data);
      return { error: data.error || `API error ${response.status}` };
    }
    return { text: data.text || "" };
  } catch (e) {
    console.error("Fetch error:", e);
    return { error: e.message };
  }
}

function isLowEffort(text) {
  if (!text || text.trim().length < 5) return true;
  const low = /^(test|asdf|xxx|aaa|bbb|nie wiem|nic|coś|cokolwiek|blabla|hej|elo|siema|tak|nie|ok|dupa|xd|haha|lol|idk|nothing|whatever|hello|hi|yes|no|nope)$/i;
  return low.test(text.trim());
}

function ProgressBar({ currentStep, lang }) {
  const labels = T[lang].stepsLabels;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, margin: "0 auto 36px", maxWidth: 620 }}>
      {labels.map((label, i) => {
        const id = i + 1;
        const done = currentStep > id;
        const active = currentStep === id;
        return (
          <div key={id} style={{ display: "flex", alignItems: "center", flex: 1 }}>
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
                {done ? "✓" : id}
              </div>
              <span style={{
                fontSize: 9, marginTop: 4,
                color: active ? "#f59e0b" : done ? "#22c55e" : "rgba(255,255,255,0.3)",
                fontWeight: active ? 700 : 400,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.05em", textTransform: "uppercase",
              }}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
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

function LoadingDots({ lang }) {
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
        {T[lang].analyzing}{".".repeat(dots)}
      </p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function Home() {
  const [lang, setLang] = useState(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentInput, setCurrentInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState({});
  const [finalResult, setFinalResult] = useState(null);
  const [error, setError] = useState("");
  const [lowEffortWarning, setLowEffortWarning] = useState(false);
  const textRef = useRef(null);

  const t = lang ? T[lang] : T.pl;

  const reset = () => {
    setStep(0); setAnswers({}); setCurrentInput(""); setLoading(false);
    setGeneratedQuestions({}); setFinalResult(null); setError(""); setLowEffortWarning(false);
  };

  const fullReset = () => {
    reset();
    setLang(null);
  };

  const buildCtx = (ans) => {
    return Object.entries(ans).map(([k, v]) => `${t.ctxLabels[k]}: ${v}`).join("\n\n");
  };

  const generateQuestion = async (targetStep, ans) => {
    setLoading(true);
    setStep(targetStep);
    setError("");
    const result = await callLLM(t.prompts[targetStep], buildCtx(ans));
    if (result.error) setError(t.errorGenQuestion + " (" + result.error + ")");
    else if (result.text) setGeneratedQuestions((prev) => ({ ...prev, [targetStep]: result.text }));
    else setError(t.errorGenQuestion);
    setLoading(false);
  };

  const generateFinal = async (ans) => {
    setLoading(true);
    setError("");
    const result = await callLLM(t.finalPrompt, buildCtx(ans));
    if (result.error) { setError(t.errorGenResult + " (" + result.error + ")"); }
    else if (result.text) {
      try {
        const cleaned = result.text.replace(/```json\s*/g, "").replace(/```/g, "").trim();
        setFinalResult(JSON.parse(cleaned));
      } catch { setError(t.errorParse); }
    } else { setError(t.errorGenResult); }
    setLoading(false);
  };

  const handleNext = async () => {
    const trimmed = currentInput.trim();
    if (!trimmed) { setError(t.errorEmpty); return; }
    if (isLowEffort(trimmed)) {
      setLowEffortWarning(true);
      setError(t.errorLowEffort);
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
    const locale = lang === "pl" ? "pl-PL" : "en-US";
    const now = new Date().toLocaleDateString(locale);
    const report = `${t.reportTitle}\n${t.reportDate}: ${now}\n${t.reportAuthor}: Maciej Broniszewski · dfe.academy\n\n${t.reportScore}: ${finalResult.score}/100\n\n${t.reportAnswers}\n${Object.entries(answers).map(([k, v]) => `${k}. ${v}`).join("\n\n")}\n\n${t.reportEval}\n${finalResult.comment}\n\n${t.reportStrengths}:\n${finalResult.strengths?.map(s => `✓ ${s}`).join("\n")}\n\n${t.reportRisks}:\n${finalResult.risks?.map(r => `⚠ ${r}`).join("\n")}\n\n${t.reportNextStep}:\n→ ${finalResult.nextStep}`;
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `AI_Readiness_${now.replace(/[.\/ ]/g, "-")}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const scoreColor = (s) => s >= 75 ? "#22c55e" : s >= 50 ? "#f59e0b" : s >= 25 ? "#f97316" : "#ef4444";
  const scoreLabel = (s) => s >= 75 ? t.scoreLabels.high : s >= 50 ? t.scoreLabels.moderate : s >= 25 ? t.scoreLabels.low : t.scoreLabels.none;

  // --- LANGUAGE SELECT SCREEN ---
  if (!lang) return (
    <div style={S.container}>
      <div style={S.innerWrap}>
        <div style={S.introCard}>
          <h1 style={S.mainTitle}><span style={{ color: "#f59e0b" }}>AI</span> READINESS CHECK</h1>
          <div style={S.divider} />
          <p style={{ ...S.introText, marginBottom: 36 }}>{T.pl.selectLang}</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={S.langBtn} onClick={() => { setLang("pl"); setStep(0); }}>
              <span style={{ fontSize: 28 }}>🇵🇱</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700 }}>Polski</span>
            </button>
            <button style={S.langBtn} onClick={() => { setLang("en"); setStep(0); }}>
              <span style={{ fontSize: 28 }}>🇬🇧</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700 }}>English</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // --- INTRO SCREEN ---
  if (step === 0) return (
    <div style={S.container}>
      <div style={S.innerWrap}>
        <div style={S.introCard}>
          <div style={S.badge}>{t.badge}</div>
          <h1 style={S.mainTitle}><span style={{ color: "#f59e0b" }}>AI</span> READINESS CHECK</h1>
          <p style={S.subtitle}>{t.subtitle}</p>
          <div style={S.divider} />
          <p style={S.introText}>{t.introText}</p>
          <button style={S.primaryBtn} onClick={() => setStep(1)}>{t.startBtn}</button>
          <p style={S.authorLine}>{t.author} <strong>Maciej Broniszewski</strong> · dfe.academy</p>
        </div>
      </div>
    </div>
  );

  // --- RESULT SCREEN ---
  if (step === 8) return (
    <div style={S.container}>
      <div style={S.innerWrap}>
        <div style={S.headerBar}>
          <span style={S.headerTitle}><span style={{ color: "#f59e0b" }}>AI</span> READINESS CHECK</span>
          <button style={S.resetBtn} onClick={fullReset}>{t.newSession}</button>
        </div>
        <ProgressBar currentStep={8} lang={lang} />
        {loading ? <LoadingDots lang={lang} /> : finalResult ? (
          <div style={S.resultCard}>
            <div style={S.badge}>{t.resultBadge}</div>
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
                <h3 style={{ ...S.colTitle, color: "#22c55e" }}>{t.strengths}</h3>
                {finalResult.strengths?.map((s, i) => <p key={i} style={S.colItem}>{s}</p>)}
              </div>
              <div style={S.colCard}>
                <h3 style={{ ...S.colTitle, color: "#f97316" }}>{t.risks}</h3>
                {finalResult.risks?.map((r, i) => <p key={i} style={S.colItem}>{r}</p>)}
              </div>
            </div>
            <div style={S.nextStepBox}>
              <h3 style={S.nextStepTitle}>{t.nextStep}</h3>
              <p style={S.nextStepText}>{finalResult.nextStep}</p>
            </div>
            <button style={S.primaryBtn} onClick={downloadReport}>{t.download}</button>
            <p style={S.authorLine}>{t.toolBy} <strong>Maciej Broniszewski</strong> · dfe.academy</p>
          </div>
        ) : error ? (
          <div style={S.card}>
            <p style={S.errorText}>{error}</p>
            <button style={S.primaryBtn} onClick={() => generateFinal(answers)}>{t.retry}</button>
          </div>
        ) : null}
      </div>
    </div>
  );

  // --- QUESTION STEPS ---
  return (
    <div style={S.container}>
      <div style={S.innerWrap}>
        <div style={S.headerBar}>
          <span style={S.headerTitle}><span style={{ color: "#f59e0b" }}>AI</span> READINESS CHECK</span>
          <button style={S.resetBtn} onClick={fullReset}>{t.newSession}</button>
        </div>
        <ProgressBar currentStep={step} lang={lang} />
        {loading ? <LoadingDots lang={lang} /> : (
          <div style={S.card}>
            <div style={S.stepHeader}>
              <span style={S.stepIcon}>{STEP_ICONS[step]}</span>
              <div>
                <div style={S.stepLabel}>{t.stepOf(step)}</div>
                <h2 style={S.stepTitle}>{t.stepTitles[step]}</h2>
              </div>
            </div>
            {step === 1 ? (
              <div>
                <p style={S.questionText}>{t.question1}</p>
                <p style={S.hintText}>{t.hint1}</p>
              </div>
            ) : (
              <div style={S.questionText}>
                {generatedQuestions[step]?.split("\n").map((line, i) => (
                  <p key={i} style={line.startsWith("💡") ? S.hintText : { margin: "0 0 12px" }}>{line}</p>
                ))}
              </div>
            )}
            <textarea ref={textRef} style={S.textarea}
              placeholder={t.placeholder}
              value={currentInput}
              onChange={(e) => { setCurrentInput(e.target.value); setError(""); setLowEffortWarning(false); }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleNext(); } }}
              rows={4}
            />
            {error && (
              <div style={S.errorBox}>
                <p style={S.errorText}>{error}</p>
                {lowEffortWarning && <button style={S.resetSmallBtn} onClick={fullReset}>{t.startOver}</button>}
              </div>
            )}
            <div style={S.btnRow}>
              <span style={S.timerHint}>{t.timer}</span>
              <button style={S.primaryBtn} onClick={handleNext}>{step === 7 ? t.showResult : t.nextBtn}</button>
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
  langBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "20px 36px", cursor: "pointer", color: "#e8e8ed", transition: "all 0.2s ease" },
};
