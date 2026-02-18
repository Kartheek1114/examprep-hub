import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExamCard from "@/components/ExamCard";
import api from "@/lib/api";

const examCategories = ["All", "SSC", "UPSC", "Banking", "Railway", "State PSC", "Defence", "JEE"];

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get("/api/exams");
        setExams(res.data);
      } catch (err) {
        console.error("Error fetching exams:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const filtered = exams.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.shortName.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || e.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl font-bold mb-3">All <span className="text-gradient">Government Exams</span></h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Browse exams, view syllabus, cut-offs, vacancies and start practicing PYQs.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md mx-auto md:mx-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search exams..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2 flex-wrap justify-center md:justify-start">
            {examCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${category === cat ? "gradient-primary text-primary-foreground shadow-primary-glow" : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">Loading exams...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((exam) => (
                <ExamCard key={exam.id} {...exam} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">No exams found matching your search.</div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Exams;
