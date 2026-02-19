import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Clock, CheckCircle2, XCircle, ChevronRight, RotateCcw, BarChart3, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { toast } from "sonner";
import { type Question } from "@/data/exams";

interface QuestionResult {
  questionId: string;
  selectedAnswer: number | null;
  correct: boolean;
  timeTaken: number; // seconds
  subject: string;
}

const Practice = () => {
  const [searchParams] = useSearchParams();
  const examIdParam = searchParams.get("exam");
  const yearParam = searchParams.get("year");

  const [allExams, setAllExams] = useState<any[]>([]);
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState("All Sections");
  const [practiceModeActive, setPracticeModeActive] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get("/api/exams");
        setAllExams(res.data);

        // If exam is specified in URL, pre-select it
        if (examIdParam) {
          setSelectedExams([examIdParam]);
          setPracticeModeActive(true);
        }
      } catch (err) {
        console.error("Error fetching exams:", err);
        toast.error("Failed to load exams");
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [examIdParam]);

  // Fetch exam data when exams are selected
  useEffect(() => {
    if (selectedExams.length > 0 && practiceModeActive) {
      const fetchSelectedExamsData = async () => {
        try {
          const examsData = await Promise.all(
            selectedExams.map(examId =>
              api.get(`/api/exams/${examId}`)
            )
          );
          setExam({
            combined: true,
            exams: examsData.map(res => res.data),
            selectedExamIds: selectedExams
          });
        } catch (err) {
          console.error("Error fetching exam data:", err);
          toast.error("Failed to load exam data");
        }
      };
      fetchSelectedExamsData();
    }
  }, [selectedExams, practiceModeActive]);

  const handleExamToggle = (examId: string) => {
    setSelectedExams(prev =>
      prev.includes(examId)
        ? prev.filter(id => id !== examId)
        : [...prev, examId]
    );
  };

  const handleStartPractice = () => {
    if (selectedExams.length === 0) {
      toast.error("Please select at least one exam");
      return;
    }
    setPracticeModeActive(true);
    setCurrentIndex(0);
    setSelectedSubject("All Sections");
  };

  const allQuestions: Question[] = exam?.combined
    ? exam.exams
      ?.flatMap((e: any) =>
        e.previousYearPapers
          ?.filter((p: any) => !yearParam || p.year.toString() === yearParam)
          ?.flatMap((p: any) => p.questions) || []
      ) || []
    : exam?.previousYearPapers
      ?.filter((p: any) => !yearParam || p.year.toString() === yearParam)
      ?.flatMap((p: any) => p.questions) || [];

  const subjects = ["All Sections", ...Array.from(new Set(allQuestions.map(q => q.subject))).filter(Boolean)];

  const questions = selectedSubject === "All Sections"
    ? allQuestions
    : allQuestions.filter(q => q.subject === selectedSubject);

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [timer, setTimer] = useState(0);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQ = questions[currentIndex];

  const startTimer = useCallback(() => {
    setTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (!finished) startTimer();
    return () => stopTimer();
  }, [currentIndex, finished, startTimer, stopTimer]);

  const handleAnswer = (optionIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    stopTimer();
    setShowResult(true);
    setResults((prev) => [
      ...prev,
      {
        questionId: currentQ.id,
        selectedAnswer,
        correct: selectedAnswer === currentQ.correctAnswer,
        timeTaken: timer,
        subject: currentQ.subject,
      },
    ]);

    // Save solved question to localStorage instead of backend
    const saveSolvedQuestion = () => {
      try {
        const solvedQuestion = {
          id: `${examIdParam || 'ssc-cgl'}-${Date.now()}`,
          text: currentQ.text,
          examId: examIdParam || "ssc-cgl",
          subject: currentQ.subject,
          correct: selectedAnswer === currentQ.correctAnswer,
          timeTaken: timer,
          timestamp: Date.now(),
          options: currentQ.options,
          selectedAnswer,
          correctAnswer: currentQ.correctAnswer
        };

        // Get existing solved questions
        const existing = localStorage.getItem('solvedQuestions');
        const solvedQuestions = existing ? JSON.parse(existing) : [];

        // Add new question
        solvedQuestions.push(solvedQuestion);

        // Keep only last 100 questions to avoid storage limits
        if (solvedQuestions.length > 100) {
          solvedQuestions.shift();
        }

        // Save back to localStorage
        localStorage.setItem('solvedQuestions', JSON.stringify(solvedQuestions));
        console.log("✅ Question saved to localStorage:", solvedQuestion);
        toast.success("Progress saved!");
      } catch (err) {
        console.error("❌ Error saving to localStorage:", err);
        toast.error("Failed to save progress locally.");
      }
    };
    saveSolvedQuestion();
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setFinished(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setResults([]);
    setFinished(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">Loading practice session...</div>
      <Footer />
    </div>
  );

  // Exam Selection Screen
  if (!practiceModeActive) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-10 max-w-4xl">
          <div className="text-center mb-10 md:mb-12 animate-slide-up">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <BarChart3 className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Select Exams to Practice</h1>
            <p className="text-muted-foreground text-sm md:text-lg">Choose one or more exams. Practice questions will be from selected exams only.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {allExams.map((examOption) => (
              <div
                key={examOption.id}
                onClick={() => handleExamToggle(examOption.id)}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all transform hover:scale-[1.02] ${selectedExams.includes(examOption.id)
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                  : "border-border bg-card hover:border-primary/50"
                  }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mt-1 transition-all ${selectedExams.includes(examOption.id)
                      ? "bg-primary border-primary"
                      : "border-border"
                      }`}>
                      {selectedExams.includes(examOption.id) && (
                        <Check className="w-4 h-4 text-primary-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg">{examOption.shortName}</h3>
                      <p className="text-sm text-muted-foreground">{examOption.name}</p>
                    </div>
                  </div>
                  <span className="text-2xl">{examOption.icon}</span>
                </div>

                <div className="text-xs text-muted-foreground space-y-1 ml-9">
                  <p>Category: <span className="font-medium text-foreground">{examOption.category}</span></p>
                  <p>Questions: <span className="font-medium text-foreground">
                    {examOption.previousYearPapers?.reduce((sum: number, p: any) => sum + (p.questions?.length || 0), 0) || 0}
                  </span></p>
                </div>
              </div>
            ))}
          </div>

          {selectedExams.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-6">
              <p className="text-sm text-foreground">
                <span className="font-bold">{selectedExams.length}</span> exam(s) selected
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Link to="/exams">
              <Button variant="outline">Browse All Exams</Button>
            </Link>
            <Button
              onClick={handleStartPractice}
              disabled={selectedExams.length === 0}
              className="gradient-primary text-primary-foreground border-0 gap-2 px-8 py-3 text-lg shadow-lg shadow-primary/20"
            >
              Start Practice <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-center p-6">
          <div>
            <h2 className="font-heading text-2xl font-bold mb-2">No Questions Available</h2>
            <p className="text-muted-foreground mb-4">Questions for the selected exam(s) will be added soon.</p>
            <Button onClick={() => setPracticeModeActive(false)} variant="outline">Select Different Exams</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Results screen
  if (finished) {
    const correct = results.filter((r) => r.correct).length;
    const totalTime = results.reduce((s, r) => s + r.timeTaken, 0);
    const avgTime = results.length > 0 ? totalTime / results.length : 0;

    // Topic-wise breakdown
    const topicMap: Record<string, { correct: number; total: number; totalTime: number }> = {};
    results.forEach((r) => {
      if (!topicMap[r.subject]) topicMap[r.subject] = { correct: 0, total: 0, totalTime: 0 };
      topicMap[r.subject].total++;
      topicMap[r.subject].totalTime += r.timeTaken;
      if (r.correct) topicMap[r.subject].correct++;
    });

    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
          <div className="text-center mb-10 animate-slide-up">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <BarChart3 className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="font-heading text-3xl font-bold mb-2">Practice Complete!</h1>
            <p className="text-muted-foreground">
              {exam?.combined
                ? `${selectedExams.length} exam(s) — `
                : exam?.shortName ? `${exam.shortName} — ` : ""
              }
              {results.length} questions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-card rounded-xl border border-border p-5 text-center shadow-card">
              <div className="font-heading text-3xl font-bold text-primary">{correct}/{results.length}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-5 text-center shadow-card">
              <div className="font-heading text-3xl font-bold text-secondary">{formatTime(totalTime)}</div>
              <div className="text-sm text-muted-foreground">Total Time</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-5 text-center shadow-card">
              <div className="font-heading text-3xl font-bold text-accent">{Math.round(avgTime)}s</div>
              <div className="text-sm text-muted-foreground">Avg / Question</div>
            </div>
          </div>

          {/* Topic-wise breakdown */}
          <h2 className="font-heading text-xl font-bold mb-4">Topic-wise Analysis</h2>
          <div className="space-y-3 mb-8">
            {Object.entries(topicMap).map(([subject, data]) => (
              <div key={subject} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{subject}</div>
                  <div className="text-xs text-muted-foreground">{data.correct}/{data.total} correct · Avg {Math.round(data.totalTime / data.total)}s/q</div>
                </div>
                <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full gradient-primary" style={{ width: `${(data.correct / data.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Per-question breakdown */}
          <h2 className="font-heading text-xl font-bold mb-4">Question Details</h2>
          <div className="space-y-2 mb-8">
            {results.map((r, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-3 flex items-center gap-3">
                {r.correct ? <CheckCircle2 className="w-5 h-5 text-accent shrink-0" /> : <XCircle className="w-5 h-5 text-destructive shrink-0" />}
                <span className="text-sm flex-1">Q{i + 1} — {r.subject}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{r.timeTaken}s</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <Button onClick={handleRestart} variant="outline" className="gap-2"><RotateCcw className="w-4 h-4" />Restart</Button>
            <Button onClick={() => { setPracticeModeActive(false); setFinished(false); }} variant="outline" className="gap-2">Select Different Exams</Button>
            <Link to="/exams"><Button className="gradient-primary text-primary-foreground border-0 gap-2">More Exams <ChevronRight className="w-4 h-4" /></Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Timer moved here */}
              <div className={`bg-card rounded-2xl border p-6 text-center shadow-xl shadow-primary/5 transition-colors ${timer > 60 ? "border-destructive/50 bg-destructive/5" : timer > 30 ? "border-secondary/50 bg-secondary/5" : "border-border"}`}>
                <div className="flex items-center justify-center gap-3 mb-1">
                  <Clock className={`w-5 h-5 ${timer > 60 ? "text-destructive animate-pulse" : timer > 30 ? "text-secondary" : "text-primary"}`} />
                  <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Time Elapsed</span>
                </div>
                <div className={`font-heading text-4xl font-black tracking-tight ${timer > 60 ? "text-destructive" : "text-foreground"}`}>{formatTime(timer)}</div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
                <h3 className="font-heading font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Practice Sections
                </h3>
                <div className="space-y-1">
                  {subjects.map((s) => {
                    const count = s === "All Sections"
                      ? allQuestions.length
                      : allQuestions.filter(q => q.subject === s).length;

                    return (
                      <button
                        key={s}
                        onClick={() => handleSubjectChange(s)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between group ${selectedSubject === s
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        <span>{s}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedSubject === s ? "bg-primary-foreground/20" : "bg-muted group-hover:bg-background"
                          }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="text-[10px] font-bold text-primary uppercase mb-1">Current Session</div>
                  <div className="text-xs text-muted-foreground leading-relaxed mb-4">
                    You are practicing <strong>{selectedSubject}</strong>.
                    {selectedSubject === "All Sections" ? " Questions from all topics will appear." : ` Only questions related to ${selectedSubject} will be shown.`}
                  </div>
                  <Button
                    onClick={() => { setFinished(false); setPracticeModeActive(false); }}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                  >
                    Change Exams
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Question Area */}
          <div className="flex-1 max-w-5xl">
            {/* Progress bar */}
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-sm font-bold text-foreground/80 uppercase tracking-wide">
                {exam?.combined
                  ? `${selectedExams.length} exam(s)`
                  : exam?.shortName || "Practice"
                }
                <span className="text-muted-foreground mx-1">/</span> {selectedSubject}
              </span>
              <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded-md">Question {currentIndex + 1} of {questions.length}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted mb-8 overflow-hidden">
              <div className="h-full rounded-full gradient-primary transition-all duration-500 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" style={{ width: `${((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100}%` }} />
            </div>

            {/* Question Card */}
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 md:p-10 shadow-xl shadow-primary/5 mb-8 border-t-4 border-t-primary animate-fade-in" key={`${selectedSubject}-${currentIndex}`}>
              <div className="flex items-center gap-3 mb-6">
                <span className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold ${currentQ.difficulty === "easy" ? "bg-emerald-500/10 text-emerald-600" :
                  currentQ.difficulty === "medium" ? "bg-amber-500/10 text-amber-600" :
                    "bg-rose-500/10 text-rose-600"
                  }`}>
                  {currentQ.difficulty}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{currentQ.subject}</span>
              </div>
              <h2 className="font-heading text-xl md:text-2xl font-semibold mb-8 leading-snug">{currentQ.text}</h2>

              <div className="grid gap-4">
                {currentQ.options.map((opt, i) => {
                  let optionClass = "bg-background border border-border";

                  if (showResult) {
                    if (i === currentQ.correctAnswer) optionClass = "bg-emerald-500/10 border-emerald-500 text-emerald-900";
                    else if (i === selectedAnswer) optionClass = "bg-rose-500/10 border-rose-500 text-rose-900";
                    else optionClass = "bg-background border border-border opacity-40";
                  } else if (selectedAnswer === i) {
                    optionClass = "gradient-primary text-primary-foreground border-transparent shadow-lg shadow-primary/20 scale-[1.02]";
                  } else if (selectedAnswer === null) {
                    optionClass += " hover:border-primary hover:bg-primary/5 cursor-pointer";
                  } else {
                    optionClass += " cursor-default";
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      className={`w-full text-left px-6 py-5 rounded-2xl flex items-center gap-4 transition-all duration-300 font-medium ${optionClass}`}
                    >
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${selectedAnswer === i && !showResult ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                        }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-base">{opt}</span>
                      {showResult && i === currentQ.correctAnswer && <CheckCircle2 className="w-6 h-6 text-emerald-500 ml-auto" />}
                      {showResult && i === selectedAnswer && i !== currentQ.correctAnswer && <XCircle className="w-6 h-6 text-rose-500 ml-auto" />}
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <div className="mt-10 p-6 rounded-2xl bg-muted/50 border border-border animate-slide-up">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
                    <Zap className="w-4 h-4 text-primary" />
                    EXPLANATION
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed italic">{currentQ.explanation}</div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              {!showResult ? (
                <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null} className="h-14 px-8 rounded-2xl gradient-primary text-primary-foreground border-0 shadow-lg shadow-primary/20 hover:opacity-90 gap-2 text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNext} className="h-14 px-8 rounded-2xl gradient-secondary text-secondary-foreground border-0 gap-2 text-lg font-bold shadow-lg shadow-secondary/10 hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  {currentIndex + 1 >= questions.length ? "Finish Session" : "Next Question"} <ChevronRight className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Practice;
