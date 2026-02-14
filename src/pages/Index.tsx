import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Clock, BarChart3, Target, CheckCircle2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExamCard from "@/components/ExamCard";
import { exams } from "@/data/exams";
import heroBg from "@/assets/hero-bg.jpg";

const stats = [
  { icon: BookOpen, label: "Exams Covered", value: "20+" },
  { icon: Users, label: "Active Students", value: "50K+" },
  { icon: Target, label: "Questions", value: "1 Lakh+" },
  { icon: CheckCircle2, label: "Success Rate", value: "89%" },
];

const features = [
  { icon: BookOpen, title: "Comprehensive Syllabus", desc: "Complete syllabus breakdown for every government exam with topic-wise details." },
  { icon: Clock, title: "Timed Practice", desc: "Per-question timer to track your speed and improve time management skills." },
  { icon: BarChart3, title: "Performance Analytics", desc: "Detailed topic-wise analytics and progress tracking to identify weak areas." },
  { icon: Target, title: "Previous Year Papers", desc: "Practice with actual previous year questions with detailed solutions." },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-95" />
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm text-primary-foreground/90">Trusted by 50,000+ aspirants</span>
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight animate-slide-up">
              Crack Your <span className="text-gradient-secondary">Government Exam</span> with Confidence
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/70 mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Practice PYQs, track your time per question, analyze your performance — all in one platform. SSC, UPSC, Banking, Railway & more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/exams">
                <Button size="lg" className="gradient-secondary text-secondary-foreground border-0 text-base px-8 shadow-lg hover:opacity-90 transition-opacity gap-2">
                  Explore Exams <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/practice">
                <Button size="lg" variant="outline" className="text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Start Practicing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5 text-center shadow-card hover-lift">
              <s.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="font-heading text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Exams */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">Popular <span className="text-gradient">Exams</span></h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Choose from a wide range of government exams and start your preparation today.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.slice(0, 6).map((exam) => (
            <ExamCard key={exam.id} {...exam} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/exams">
            <Button variant="outline" size="lg" className="gap-2">View All Exams <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-card border-y border-border py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">Why Choose <span className="text-gradient">GovPrep</span>?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Everything you need to crack your government exam, in one place.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-xl border border-border bg-background hover-lift shadow-card group">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="gradient-primary rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          <div className="relative">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Ready to Start Your Preparation?</h2>
            <p className="text-primary-foreground/70 mb-8 max-w-lg mx-auto">Join thousands of aspirants who are already preparing with GovPrep. It's free to get started!</p>
            <Link to="/signup">
              <Button size="lg" className="gradient-secondary text-secondary-foreground border-0 text-base px-8 shadow-lg hover:opacity-90 transition-opacity">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
