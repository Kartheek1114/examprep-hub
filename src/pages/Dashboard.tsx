import { BookOpen, Clock, Target, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { exams } from "@/data/exams";

const Dashboard = () => {
  // Static demo data — will be dynamic once auth & DB are connected
  const stats = [
    { icon: Target, label: "Questions Attempted", value: "0", color: "text-primary" },
    { icon: TrendingUp, label: "Accuracy", value: "—", color: "text-accent" },
    { icon: Clock, label: "Time Spent", value: "0 min", color: "text-secondary" },
    { icon: BookOpen, label: "Exams Practiced", value: "0", color: "text-primary" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Track your preparation progress and performance.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((s, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5 shadow-card hover-lift">
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

        {/* Empty state for activity */}
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <BarChartIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-lg font-bold mb-2">No Activity Yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Start practicing to see your performance analytics here.</p>
          <Link to="/exams">
            <Button className="gradient-primary text-primary-foreground border-0 shadow-primary-glow gap-2">
              Start Practicing <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
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
