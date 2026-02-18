import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { exams } from "@/data/exams";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { BookOpen, Clock, Target, TrendingUp, ArrowRight, RefreshCw, CheckCircle2, XCircle } from "lucide-react";

const Dashboard = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const location = useLocation();

  const fetchUser = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      const res = await api.get("/api/user/me");
      setUserData(res.data);
      if (res.data.email) {
        localStorage.setItem("userEmail", res.data.email);
      }
      if (showToast) toast.success("Stats refreshed!");
    } catch (err) {
      toast.error("Failed to fetch user data");
    } finally {
      setLoading(false);
      if (showToast) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [location.pathname]); // Refetch when navigating to Dashboard

  // Also refetch when window gains focus or becomes visible
  useEffect(() => {
    const handleFocus = () => {
      if (location.pathname === '/dashboard') {
        fetchUser();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && location.pathname === '/dashboard') {
        fetchUser();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location.pathname]);



  // Get solved questions from localStorage
  const getSolvedQuestions = () => {
    try {
      const stored = localStorage.getItem('solvedQuestions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const solvedQuestions = getSolvedQuestions();
  // Use Backend Data for Stats if available (Cross-device sync), else fallback to localStorage
  const progressData = userData?.progress || [];

  const totalAttempted = progressData.reduce((acc: number, p: any) => acc + (p.questionsAttempted || 0), 0) || solvedQuestions.length;
  const totalCorrect = progressData.reduce((acc: number, p: any) => acc + (p.questionsCorrect || 0), 0) || solvedQuestions.filter((q: any) => q.correct).length;
  const totalTime = progressData.reduce((acc: number, p: any) => acc + (p.totalTimeSpent || 0), 0) || solvedQuestions.reduce((acc: number, q: any) => acc + (q.timeTaken || 0), 0);

  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const uniqueExamsCount = progressData.length > 0
    ? new Set(progressData.map((p: any) => p.examId)).size
    : new Set(solvedQuestions.map((q: any) => q.examId)).size;

  const stats = [
    { icon: Target, label: "Questions Attempted", value: totalAttempted.toString(), color: "text-primary" },
    { icon: TrendingUp, label: "Accuracy", value: totalAttempted > 0 ? `${accuracy}%` : "—", color: "text-accent" },
    { icon: Clock, label: "Time Spent", value: `${Math.round(totalTime / 60)} min`, color: "text-secondary" },
    { icon: BookOpen, label: "Exams Practiced", value: uniqueExamsCount.toString(), color: "text-primary" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold mb-1">
              Welcome, {userData?.name || "Aspirant"}!
            </h1>
            <p className="text-muted-foreground">Track your preparation progress and performance.</p>
          </div>
          <button
            onClick={() => fetchUser(true)}
            disabled={refreshing}
            className="p-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
            title="Refresh Stats"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((s, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5 shadow-card hover-lift flex flex-col items-center sm:items-start text-center sm:text-left">
              <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
              <div className="font-heading text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Start */}
        <h2 className="font-heading text-xl font-bold mb-4">Quick Start Practice</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {exams.slice(0, 3).map((exam) => (
            <Link key={exam.id} to={`/practice?exam=${exam.id}`} className="group">
              <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4 hover-lift shadow-card">
                <span className="text-3xl">{exam.icon}</span>
                <div className="flex-1">
                  <div className="font-heading font-semibold group-hover:text-primary transition-colors">{exam.shortName}</div>
                  <div className="text-xs text-muted-foreground">{exam.previousYearPapers.flatMap(p => p.questions).length} questions</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {/* Solved Questions */}
        {solvedQuestions.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-bold">Recent Solved Questions</h2>
              <button
                onClick={() => {
                  if (confirm('Clear all solved questions history?')) {
                    localStorage.removeItem('solvedQuestions');
                    window.location.reload();
                  }
                }}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Clear History
              </button>
            </div>
            <div className="space-y-3 mb-10">
              {solvedQuestions.slice(-10).reverse().map((q: any, i: number) => (
                <div key={i} className="bg-card rounded-xl border border-border p-4 shadow-card">
                  <div className="flex items-start gap-3">
                    {q.correct ? (
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm mb-1 line-clamp-2">{q.text}</div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {q.subject}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {q.timeTaken}s
                        </span>
                        <span>•</span>
                        <span>{new Date(q.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}


      </main>
      <Footer />
    </div>
  );
};

// Simple bar chart icon to avoid extra import
const BarChartIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

export default Dashboard;
