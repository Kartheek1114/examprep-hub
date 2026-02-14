import { useParams, Link } from "react-router-dom";
import { BookOpen, Users, Calendar, TrendingUp, GraduationCap, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { exams } from "@/data/exams";

const ExamDetail = () => {
  const { examId } = useParams();
  const exam = exams.find((e) => e.id === examId);

  if (!exam) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold mb-2">Exam Not Found</h1>
            <Link to="/exams" className="text-primary hover:underline">Browse all exams</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const totalMarks = exam.syllabus.reduce((s, sec) => s + sec.marks, 0);
  const totalQuestions = exam.previousYearPapers.reduce((s, p) => s + p.questions.length, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="gradient-hero py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl">{exam.icon}</span>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20">{exam.category}</span>
              </div>
              <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-4">{exam.name}</h1>
              <p className="text-primary-foreground/70 text-lg mb-8">{exam.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Users, label: "Vacancies", value: exam.vacancies },
                  { icon: TrendingUp, label: "Last Cut-off", value: exam.lastCutoff },
                  { icon: Calendar, label: "Next Exam", value: exam.nextExamDate },
                  { icon: GraduationCap, label: "Eligibility", value: exam.eligibility },
                ].map((info, i) => (
                  <div key={i} className="bg-primary-foreground/10 backdrop-blur rounded-xl p-4 border border-primary-foreground/10">
                    <info.icon className="w-5 h-5 text-secondary mb-2" />
                    <div className="text-xs text-primary-foreground/60">{info.label}</div>
                    <div className="text-sm font-semibold text-primary-foreground">{info.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Syllabus */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="font-heading text-2xl font-bold mb-6">Syllabus <span className="text-muted-foreground font-normal text-base">({totalMarks} marks)</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exam.syllabus.map((sec, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6 hover-lift shadow-card">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-heading font-semibold text-lg">{sec.subject}</h3>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full gradient-primary text-primary-foreground">{sec.marks} marks</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sec.topics.map((topic, j) => (
                    <span key={j} className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground">{topic}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Practice CTA */}
        <section className="container mx-auto px-4 pb-12">
          <div className="bg-card rounded-xl border border-border p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl gradient-secondary flex items-center justify-center">
                <Clock className="w-7 h-7 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold">Practice PYQs</h3>
                <p className="text-muted-foreground text-sm">{totalQuestions} questions available with per-question timer & explanations</p>
              </div>
            </div>
            <Link to={`/practice?exam=${exam.id}`}>
              <Button className="gradient-primary text-primary-foreground border-0 shadow-primary-glow hover:opacity-90 gap-2">
                Start Practice <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ExamDetail;
