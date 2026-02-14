import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Clock, CheckCircle2, XCircle, ChevronRight, RotateCcw, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { exams, type Question } from "@/data/exams";

interface QuestionResult {
  questionId: string;
  selectedAnswer: number | null;
  correct: boolean;
  timeTaken: number; // seconds
  subject: string;
}

const Practice = () => {
  const [searchParams] = useSearchParams();
  const examId = searchParams.get("exam") || exams[0].id;
  const exam = exams.find((e) => e.id === examId) || exams[0];
  const questions: Question[] = exam.previousYearPapers.flatMap((p) => p.questions);

  const [currentIndex, setCurrentIndex] = useState(0);
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

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setResults([]);
    setFinished(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-center p-6">
          <div>
            <h2 className="font-heading text-2xl font-bold mb-2">No Questions Available</h2>
            <p className="text-muted-foreground mb-4">Questions for this exam will be added soon.</p>
            <Link to="/exams"><Button variant="outline">Browse Exams</Button></Link>
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
            <p className="text-muted-foreground">{exam.shortName} — {results.length} questions</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
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

          <div className="flex gap-3 justify-center">
            <Button onClick={handleRestart} variant="outline" className="gap-2"><RotateCcw className="w-4 h-4" />Restart</Button>
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
      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
        {/* Progress bar */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-medium">{exam.shortName}</span>
          <span className="text-sm text-muted-foreground">Question {currentIndex + 1} of {questions.length}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted mb-8 overflow-hidden">
          <div className="h-full rounded-full gradient-primary transition-all duration-500" style={{ width: `${((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>

        {/* Timer */}
        <div className="flex justify-center mb-6">
          <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border ${timer > 60 ? "border-destructive/50 bg-destructive/10" : timer > 30 ? "border-secondary/50 bg-secondary/10" : "border-border bg-card"} shadow-card`}>
            <Clock className={`w-5 h-5 ${timer > 60 ? "text-destructive" : timer > 30 ? "text-secondary" : "text-primary"}`} />
            <span className={`font-heading text-xl font-bold ${timer > 60 ? "text-destructive" : ""}`}>{formatTime(timer)}</span>
          </div>
        </div>

        {/* Question */}
        <div className="bg-card rounded-xl border border-border p-6 md:p-8 shadow-card mb-6 animate-fade-in" key={currentIndex}>
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              currentQ.difficulty === "easy" ? "bg-accent/20 text-accent" : currentQ.difficulty === "medium" ? "bg-secondary/20 text-secondary" : "bg-destructive/20 text-destructive"
            }`}>{currentQ.difficulty}</span>
            <span className="text-xs text-muted-foreground">{currentQ.subject}</span>
          </div>
          <h2 className="font-heading text-xl font-semibold mb-6">{currentQ.text}</h2>

          <div className="space-y-3">
            {currentQ.options.map((opt, i) => {
              let optionClass = "bg-background border border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer";
              if (showResult) {
                if (i === currentQ.correctAnswer) optionClass = "bg-accent/10 border-accent";
                else if (i === selectedAnswer) optionClass = "bg-destructive/10 border-destructive";
                else optionClass = "bg-background border border-border opacity-50";
              } else if (selectedAnswer === i) {
                optionClass = "gradient-primary text-primary-foreground border-transparent";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  className={`w-full text-left px-5 py-4 rounded-xl flex items-center gap-3 transition-all ${optionClass}`}
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                    selectedAnswer === i && !showResult ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm font-medium">{opt}</span>
                  {showResult && i === currentQ.correctAnswer && <CheckCircle2 className="w-5 h-5 text-accent ml-auto" />}
                  {showResult && i === selectedAnswer && i !== currentQ.correctAnswer && <XCircle className="w-5 h-5 text-destructive ml-auto" />}
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className="mt-6 p-4 rounded-xl bg-muted border border-border animate-fade-in">
              <div className="text-sm font-medium mb-1">Explanation:</div>
              <div className="text-sm text-muted-foreground">{currentQ.explanation}</div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          {!showResult ? (
            <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null} className="gradient-primary text-primary-foreground border-0 shadow-primary-glow hover:opacity-90 gap-2">
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNext} className="gradient-secondary text-secondary-foreground border-0 gap-2">
              {currentIndex + 1 >= questions.length ? "View Results" : "Next Question"} <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Practice;
