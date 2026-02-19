import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle2, Zap, ListPlus, BookOpen, FileText, PlusCircle } from "lucide-react";

/**
 * AdminUpload Component
 * Handles bulk upload of questions via pasted text, manual single question entry,
 * and updating exam-specific details (vacancies, cutoffs, etc.).
 */
const AdminUpload = () => {
    // Basic States
    const [exams, setExams] = useState([]);
    const [examId, setExamId] = useState("");
    const [year, setYear] = useState("");
    const [paperName, setPaperName] = useState("");
    const [pastedText, setPastedText] = useState("");
    const [uploadMode, setUploadMode] = useState("flash"); // 'flash', 'manual', 'json', 'details', or 'new'
    const [uploading, setUploading] = useState(false);

    // New Exam State
    const [newExam, setNewExam] = useState({
        title: "",
        shortName: "",
        category: "SSC",
        description: "",
        icon: "🏛️",
        eligibility: ""
    });

    // Manual Entry States
    const [manualQuestion, setManualQuestion] = useState("");
    const [manualOptions, setManualOptions] = useState(["", "", "", ""]);
    const [manualCorrect, setManualCorrect] = useState("");
    const [manualSubject, setManualSubject] = useState("");
    const [manualDifficulty, setManualDifficulty] = useState("medium");
    const [manualExplanation, setManualExplanation] = useState("");

    // Details Mode State
    const [details, setDetails] = useState({
        vacancies: "",
        lastCutoff: "",
        nextExamDate: "",
        eligibility: "",
        description: ""
    });

    // Preview States
    const [previewData, setPreviewData] = useState([]);
    const [isReviewing, setIsReviewing] = useState(false);

    // Fetch exams on mount
    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await api.get("/api/exams");
                setExams(res.data);
            } catch (err) {
                console.error("Error fetching exams:", err);
                toast.error("Failed to load exams database.");
            }
        };
        fetchExams();
    }, []);

    // Parse pasted text for preview
    const handlePreview = () => {
        if (!pastedText.trim()) {
            toast.error("Please paste your questions first");
            return;
        }

        const lines = pastedText.trim().split('\n').filter(l => l.trim());
        if (lines.length < 2) {
            toast.error("Format error: Need a header row and data rows.");
            return;
        }

        try {
            const rawHeaders = lines[0].split(/\t|\s{2,}/).map(h => h.trim().toLowerCase());
            const rows = lines.slice(1).map(line => {
                const cols = line.split(/\t|\s{2,}/).map(c => c.trim());
                const row = {};
                rawHeaders.forEach((h, i) => row[h] = cols[i]);
                return row;
            });

            // Map to structured objects
            const mapped = rows.map(r => {
                let ans = r.correctanswer || r.answer;
                let finalAns = 0;

                // Handle numeric strings (1, 2, 3, 4)
                if (ans !== undefined && !isNaN(parseInt(ans))) {
                    const numericAns = parseInt(ans);
                    // normalize 1->0, 2->1 ... or keep 0->0
                    finalAns = numericAns > 0 && numericAns <= 4 ? numericAns - 1 : numericAns;
                }
                // Handle letters (A, B, C, D)
                else if (typeof ans === 'string') {
                    const letterPos = ["a", "b", "c", "d"].indexOf(ans.toLowerCase().trim());
                    if (letterPos !== -1) finalAns = letterPos;
                }

                return {
                    text: r.question || r.text || "N/A",
                    options: [r.option1 || r.a, r.option2 || r.b, r.option3 || r.c, r.option4 || r.d].filter(opt => opt !== undefined),
                    correctAnswer: finalAns,
                    subject: r.subject || "General",
                    difficulty: r.difficulty || "medium",
                    explanation: r.explanation || ""
                };
            });

            setPreviewData(mapped);
            setIsReviewing(true);
            toast.info(`Parsed ${mapped.length} questions. Please review below.`);
        } catch (err) {
            console.error("Parsing Error:", err);
            toast.error("Could not parse text. check your headers.");
        }
    };

    // Upload to database
    const handleUpload = async (e) => {
        if (e) e.preventDefault();

        if (!examId || !year) {
            toast.error("Please select an exam and enter the year");
            return;
        }

        let questionsToUpload = previewData;

        // If in direct JSON mode, parse the pasted text as JSON
        if (uploadMode === "json") {
            try {
                questionsToUpload = JSON.parse(pastedText);
                if (!Array.isArray(questionsToUpload)) {
                    toast.error("JSON must be an array of questions");
                    return;
                }
            } catch (err) {
                toast.error("Invalid JSON format. Please check your syntax.");
                return;
            }
        }

        if (questionsToUpload.length === 0 && !pastedText.trim()) {
            toast.error("No data to upload");
            return;
        }

        setUploading(true);

        try {
            const res = await api.post("/api/admin/upload-text", {
                examId,
                year,
                paperName,
                text: uploadMode === "json" ? "" : pastedText,
                questions: questionsToUpload.length > 0 ? questionsToUpload : undefined
            });

            if (res.data.duplicatesCount > 0) {
                toast.warning(res.data.message);
            } else {
                toast.success(res.data.message);
            }
            setIsReviewing(false);
            setPreviewData([]);
            setPastedText("");
            setYear("");
            setPaperName("");
        } catch (err) {
            console.error("Upload Error Details:", err);
            const status = err.response?.status;
            const errorData = err.response?.data;
            const errorMsg = errorData?.message || err.message || "Unknown Upload Error (Check if server is running on port 5000)";

            toast.error(`Error (${status || 'Network'}): ${errorMsg}`);

            if (errorData?.errors && Array.isArray(errorData.errors)) {
                errorData.errors.slice(0, 3).forEach(e => toast.error(`Detail: ${e}`));
            }
        } finally {
            setUploading(false);
        }
    };

    // Manual single entry
    const handleManualSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!examId || !year || !manualQuestion || manualOptions.some(o => !o) || manualCorrect === "") {
            toast.error("Please fill in all required fields (Question, 4 Options, and Correct Answer)");
            return;
        }

        setUploading(true);

        try {
            await api.post(`/api/exams/${examId}/questions`, {
                year: parseInt(year),
                question: {
                    text: manualQuestion,
                    options: manualOptions,
                    correctAnswer: parseInt(manualCorrect),
                    subject: manualSubject || "General Awareness",
                    difficulty: manualDifficulty,
                    explanation: manualExplanation
                }
            });

            toast.success("Question added successfully!");
            setManualQuestion("");
            setManualOptions(["", "", "", ""]);
            setManualCorrect("");
            setManualExplanation("");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Error adding question");
        } finally {
            setUploading(false);
        }
    };

    // Update Exam Details Handler
    const handleSaveDetails = async () => {
        if (!examId) return toast.error("Please select an exam first");
        setUploading(true);
        try {
            await api.patch(`/api/exams/${examId}`, details);
            toast.success("Exam details updated successfully!");
            setExams(prev => prev.map(ex => ex.id === examId ? { ...ex, ...details } : ex));
        } catch (err) {
            console.error(err);
            toast.error("Failed to update details");
        } finally {
            setUploading(false);
        }
    };

    // Create New Exam Handler
    const handleCreateExam = async () => {
        if (!newExam.title || !newExam.shortName || !newExam.category) {
            return toast.error("Please fill in basic exam details (Name, Short Name, Category)");
        }
        setUploading(true);
        try {
            const res = await api.post("/api/admin/create", newExam);
            toast.success("New exam created successfully!");
            setExams(prev => [...prev, res.data]);
            setUploadMode("flash");
            setExamId(res.data.id);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to create exam");
        } finally {
            setUploading(false);
        }
    };

    const handleExamChange = (e) => {
        const selectedId = e.target.value;
        setExamId(selectedId);

        const selectedExam = exams.find(ex => ex.id === selectedId);
        if (selectedExam) {
            setDetails({
                vacancies: selectedExam.vacancies || "",
                lastCutoff: selectedExam.lastCutoff || "",
                nextExamDate: selectedExam.nextExamDate || "",
                eligibility: selectedExam.eligibility || "",
                description: selectedExam.description || ""
            });
        } else {
            setDetails({ vacancies: "", lastCutoff: "", nextExamDate: "", eligibility: "", description: "" });
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-10 max-w-2xl">
                <div className="inline-flex items-center justify-center p-2 mb-4 rounded-full bg-primary/10 text-primary">
                    <Zap className="w-6 h-6" />
                </div>
                <h1 className="font-heading text-4xl font-bold mb-3">Admin <span className="text-gradient">Question Manager</span></h1>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-6">
                    <p className="text-muted-foreground text-center sm:text-left">Choose your preferred method to add questions or update details.</p>
                    <div className="hidden sm:block h-4 w-px bg-border mx-2" />
                    <button
                        onClick={async () => {
                            try {
                                const res = await api.get("/api/admin");
                                if (res.data.includes("Working")) toast.success("Server Connected & Ready!");
                                else toast.warning("Server responded, but Admin route missing. Restart needed.");
                            } catch (e) {
                                toast.error("Server Offline or Not Responding.");
                            }
                        }}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20 text-primary hover:bg-primary/5 transition-colors"
                    >
                        Check Connection
                    </button>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap bg-muted/50 p-1.5 rounded-2xl mb-8 border border-border gap-1">
                    <button
                        onClick={() => { setUploadMode("flash"); setIsReviewing(false); }}
                        className={`flex-1 min-w-[45%] sm:min-w-0 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${uploadMode === "flash"
                            ? "bg-card text-primary shadow-sm shadow-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}
                    >
                        <Zap className="w-4 h-4" />
                        Flash
                    </button>
                    <button
                        onClick={() => { setUploadMode("json"); setIsReviewing(false); }}
                        className={`flex-1 min-w-[45%] sm:min-w-0 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${uploadMode === "json"
                            ? "bg-card text-primary shadow-sm shadow-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        JSON
                    </button>
                    <button
                        onClick={() => { setUploadMode("manual"); setIsReviewing(false); }}
                        className={`flex-1 min-w-[45%] sm:min-w-0 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${uploadMode === "manual"
                            ? "bg-card text-primary shadow-sm shadow-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}
                    >
                        <ListPlus className="w-4 h-4" />
                        Manual
                    </button>
                    <button
                        onClick={() => { setUploadMode("details"); setIsReviewing(false); }}
                        className={`flex-1 min-w-[45%] sm:min-w-0 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${uploadMode === "details"
                            ? "bg-card text-primary shadow-sm shadow-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}
                    >
                        <FileText className="w-4 h-4" />
                        Details
                    </button>
                    <button
                        onClick={() => { setUploadMode("new"); setIsReviewing(false); }}
                        className={`flex-1 min-w-[45%] sm:min-w-0 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${uploadMode === "new"
                            ? "bg-card text-primary shadow-sm shadow-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}
                    >
                        <PlusCircle className="w-4 h-4" />
                        New Exam
                    </button>
                </div>

                <div className="bg-card rounded-2xl border border-border p-8 shadow-xl shadow-primary/5">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="exam" className="text-foreground/80 font-medium">Target Exam</Label>
                            {uploadMode === "new" ? (
                                <div className="p-3 bg-muted/30 border border-dashed border-border rounded-xl text-xs text-muted-foreground italic">
                                    You are creating a new exam entry. Fill the details below.
                                </div>
                            ) : (
                                <select
                                    id="exam"
                                    className="w-full h-12 px-4 rounded-xl border border-input bg-background text-sm transition-all focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
                                    value={examId}
                                    onChange={handleExamChange}
                                >
                                    <option value="">Select an exam...</option>
                                    {exams.map((exam) => (
                                        <option key={exam.id} value={exam.id}>
                                            {exam.name || exam.title} ({exam.shortName})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {(uploadMode !== "details") && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="year" className="text-foreground/80 font-medium">Exam Year</Label>
                                    <Input
                                        id="year"
                                        type="number"
                                        placeholder="e.g. 2024"
                                        className="h-12 rounded-xl"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="paper" className="text-foreground/80 font-medium">Paper/Shift Name</Label>
                                    <Input
                                        id="paper"
                                        placeholder="e.g. Shift 1"
                                        className="h-12 rounded-xl"
                                        value={paperName}
                                        onChange={(e) => setPaperName(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Bulk Upload Mode UI */}
                        {(uploadMode === "flash" || uploadMode === "json") && (
                            isReviewing ? (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-lg">Review Parsed Data</h3>
                                        <Button variant="outline" size="sm" onClick={() => setIsReviewing(false)}>
                                            Edit Raw Text
                                        </Button>
                                    </div>
                                    <div className="border border-border rounded-xl overflow-hidden max-h-[400px] overflow-y-auto">
                                        <table className="w-full text-[11px] border-collapse bg-card">
                                            <thead className="sticky top-0 bg-muted z-10">
                                                <tr>
                                                    <th className="p-2 border-b text-left w-8">#</th>
                                                    <th className="p-2 border-b text-left">Question</th>
                                                    <th className="p-2 border-b text-left">Options</th>
                                                    <th className="p-2 border-b text-left">Ans</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {previewData.map((q, i) => (
                                                    <tr key={i} className="border-b hover:bg-muted/30">
                                                        <td className="p-2 text-muted-foreground">{i + 1}</td>
                                                        <td className="p-2 font-medium">
                                                            <div className="line-clamp-2" title={q.text}>{q.text}</div>
                                                        </td>
                                                        <td className="p-2 text-muted-foreground text-[10px]">{q.options?.length || 0} found</td>
                                                        <td className="p-2">
                                                            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                                                                {["A", "B", "C", "D"][q.correctAnswer] || "?"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Button
                                        onClick={handleUpload}
                                        disabled={uploading}
                                        className="w-full h-14 rounded-xl gradient-primary text-primary-foreground text-lg font-bold shadow-lg shadow-primary/20"
                                    >
                                        {uploading ? "Uploading..." : `Confirm & Upload ${previewData.length} Questions`}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="pasted-text" className="text-foreground/80 font-medium">
                                            {uploadMode === "json" ? "Paste JSON Array" : "Paste Data Here"}
                                        </Label>
                                        <textarea
                                            id="pasted-text"
                                            rows={10}
                                            className="w-full p-4 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed transition-all resize-none hover:border-primary/50"
                                            placeholder={uploadMode === "json" ? '[ { "text": "...", ... } ]' : "Question\tOption1\tOption2\tOption3\tOption4\tCorrectAnswer\tSubject\tDifficulty\tExplanation"}
                                            value={pastedText}
                                            onChange={(e) => setPastedText(e.target.value)}
                                        />
                                        <p className="text-[11px] text-muted-foreground italic flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full bg-primary" />
                                            {uploadMode === "json" ? "Paste a valid JSON array of question objects." : "Copy from Excel/Sheets and paste here. Use \"Preview\" to verify."}
                                        </p>
                                    </div>
                                    {uploadMode === "json" ? (
                                        <Button
                                            onClick={handleUpload}
                                            disabled={uploading}
                                            className="w-full h-14 rounded-xl bg-primary text-primary-foreground text-lg font-bold shadow-lg shadow-primary/20"
                                        >
                                            {uploading ? "Uploading JSON..." : "Direct JSON Upload"}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handlePreview}
                                            className="w-full h-14 rounded-xl border-2 border-primary text-primary text-lg font-bold transition-all text-white"
                                        >
                                            Preview & Verify Data
                                        </Button>
                                    )}
                                </div>
                            )
                        )}

                        {/* Manual Entry Mode UI */}
                        {uploadMode === "manual" && (
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-foreground/80 font-medium">Question Text</Label>
                                    <textarea
                                        className="w-full p-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed transition-all resize-none hover:border-primary/50"
                                        rows={3}
                                        placeholder="Type the question here..."
                                        value={manualQuestion}
                                        onChange={(e) => setManualQuestion(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {manualOptions.map((opt, i) => (
                                        <div key={i} className="space-y-2">
                                            <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Option {String.fromCharCode(65 + i)}</Label>
                                            <Input
                                                className="h-11 rounded-xl"
                                                placeholder={`Enter option ${String.fromCharCode(65 + i)}...`}
                                                value={opt}
                                                onChange={(e) => {
                                                    const newOpts = [...manualOptions];
                                                    newOpts[i] = e.target.value;
                                                    setManualOptions(newOpts);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-6">
                                    <div className="space-y-2">
                                        <Label className="text-foreground/80 font-medium">Correct Answer</Label>
                                        <select
                                            className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm transition-all focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
                                            value={manualCorrect}
                                            onChange={(e) => setManualCorrect(e.target.value === "" ? "" : parseInt(e.target.value))}
                                        >
                                            <option value="">Select Correct Option...</option>
                                            <option value="0">Option A</option>
                                            <option value="1">Option B</option>
                                            <option value="2">Option C</option>
                                            <option value="3">Option D</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-foreground/80 font-medium">Difficulty</Label>
                                        <select
                                            className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm transition-all focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
                                            value={manualDifficulty}
                                            onChange={(e) => setManualDifficulty(e.target.value)}
                                        >
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground/80 font-medium text-sm">Subject / Topic</Label>
                                    <Input
                                        placeholder="e.g. Reasoning, Quantitative Aptitude"
                                        className="h-11 rounded-xl"
                                        value={manualSubject}
                                        onChange={(e) => setManualSubject(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground/80 font-medium text-sm" >Solution/Explanation (Optional)</Label>
                                    <textarea
                                        className="w-full p-4 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed transition-all resize-none hover:border-primary/50"
                                        rows={2}
                                        placeholder="Add a step-by-step solution..."
                                        value={manualExplanation}
                                        onChange={(e) => setManualExplanation(e.target.value)}
                                    />
                                </div>
                                <Button
                                    onClick={handleManualSubmit}
                                    disabled={uploading}
                                    className="w-full h-14 rounded-xl bg-primary text-primary-foreground text-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                                >
                                    {uploading ? "Saving..." : "Save Individual Question"}
                                </Button>
                            </div>
                        )}

                        {/* Exam Details Mode UI */}
                        {uploadMode === "details" && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="space-y-2">
                                    <Label className="text-foreground/80 font-medium">Vacancies</Label>
                                    <Input
                                        value={details.vacancies}
                                        onChange={(e) => setDetails({ ...details, vacancies: e.target.value })}
                                        placeholder="e.g. 17,727 (Tentative)"
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground/80 font-medium">Last Year Cutoff</Label>
                                    <Input
                                        value={details.lastCutoff}
                                        onChange={(e) => setDetails({ ...details, lastCutoff: e.target.value })}
                                        placeholder="e.g. 150.5 (UR)"
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground/80 font-medium">Next Exam Date</Label>
                                    <Input
                                        value={details.nextExamDate}
                                        onChange={(e) => setDetails({ ...details, nextExamDate: e.target.value })}
                                        placeholder="e.g. Sept-Oct 2024"
                                        className="h-12 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground/80 font-medium">Eligibility</Label>
                                    <Input
                                        value={details.eligibility}
                                        onChange={(e) => setDetails({ ...details, eligibility: e.target.value })}
                                        placeholder="e.g. Bachelor's Degree"
                                        className="h-12 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground/80 font-medium">Exam Description</Label>
                                    <textarea
                                        value={details.description}
                                        onChange={(e) => setDetails({ ...details, description: e.target.value })}
                                        className="w-full p-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed transition-all resize-none hover:border-primary/50 min-h-[120px]"
                                        placeholder="Describe the exam, stages, etc."
                                    />
                                </div>
                                <Button
                                    onClick={handleSaveDetails}
                                    disabled={uploading}
                                    className="w-full h-14 rounded-xl gradient-primary text-primary-foreground text-lg font-bold shadow-lg shadow-primary/20"
                                >
                                    {uploading ? "Updating..." : "Save Exam Details"}
                                </Button>
                            </div>
                        )}

                        {/* New Exam Mode UI */}
                        {uploadMode === "new" && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-foreground/80 font-medium">Exam Full Name</Label>
                                        <Input
                                            value={newExam.title}
                                            onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                                            placeholder="e.g. SSC Combined Graduate Level"
                                            className="h-11 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-foreground/80 font-medium">Short Name (ID)</Label>
                                        <Input
                                            value={newExam.shortName}
                                            onChange={(e) => setNewExam({ ...newExam, shortName: e.target.value })}
                                            placeholder="e.g. SSC CGL"
                                            className="h-11 rounded-xl"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-foreground/80 font-medium">Category</Label>
                                        <select
                                            className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm transition-all focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
                                            value={newExam.category}
                                            onChange={(e) => setNewExam({ ...newExam, category: e.target.value })}
                                        >
                                            <option value="SSC">SSC</option>
                                            <option value="UPSC">UPSC</option>
                                            <option value="Banking">Banking</option>
                                            <option value="Railway">Railway</option>
                                            <option value="Defence">Defence</option>
                                            <option value="State PSC">State PSC</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-foreground/80 font-medium">Icon (Emoji)</Label>
                                        <Input
                                            value={newExam.icon}
                                            onChange={(e) => setNewExam({ ...newExam, icon: e.target.value })}
                                            placeholder="e.g. 🏛️"
                                            className="h-11 rounded-xl"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground/80 font-medium">Eligibility</Label>
                                    <Input
                                        value={newExam.eligibility}
                                        onChange={(e) => setNewExam({ ...newExam, eligibility: e.target.value })}
                                        placeholder="e.g. Graduate from recognized university"
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground/80 font-medium">Description</Label>
                                    <textarea
                                        value={newExam.description}
                                        onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                                        className="w-full p-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed transition-all resize-none hover:border-primary/50 min-h-[100px]"
                                        placeholder="Add a brief description of the exam..."
                                    />
                                </div>
                                <Button
                                    onClick={handleCreateExam}
                                    disabled={uploading}
                                    className="w-full h-14 rounded-xl gradient-primary text-black text-lg font-bold shadow-lg shadow-primary/20"
                                >
                                    {uploading ? "Creating..." : "Create New Exam Entry"}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AdminUpload;
