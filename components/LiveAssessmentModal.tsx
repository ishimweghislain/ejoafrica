"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2, Loader2, Radio, Clock, Info, CheckCircle2, Zap } from "lucide-react";
import { toast } from "react-hot-toast";

interface LiveAssessmentModalProps {
    isOpen: boolean;
    initialData?: any;
    onClose: () => void;
    onSuccess: () => void;
}

interface Question {
    text: string;
    options: string[];
    correctAnswer: string;
    marks: number;
    timer: number;
}

export default function LiveAssessmentModal({ isOpen, initialData, onClose, onSuccess }: LiveAssessmentModalProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [classes, setClasses] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        deadline: "",
        classId: "",
        courseId: "",
    });

    const [questions, setQuestions] = useState<Question[]>([
        { text: "", options: ["", "", "", ""], correctAnswer: "", marks: 5, timer: 30 }
    ]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || "",
                description: initialData.description || "",
                deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().slice(0, 16) : "",
                classId: initialData.classId || "",
                courseId: initialData.courseId || "",
            });
            setQuestions(initialData.questions || [{ text: "", options: ["", "", "", ""], correctAnswer: "", marks: 5, timer: 30 }]);
        } else {
            setFormData({ title: "", description: "", deadline: "", classId: "", courseId: "" });
            setQuestions([{ text: "", options: ["", "", "", ""], correctAnswer: "", marks: 5, timer: 30 }]);
        }
    }, [initialData, isOpen]);

    useEffect(() => {
        async function loadData() {
            try {
                const [clsRes, crsRes] = await Promise.all([
                    fetch("/api/classes"),
                    fetch("/api/courses")
                ]);
                const [clsData, crsData] = await Promise.all([clsRes.json(), crsRes.json()]);
                setClasses(clsData);
                setCourses(crsData);
            } catch (err) {
                console.error(err);
            } finally {
                setFetchingData(false);
            }
        }
        if (isOpen) loadData();
    }, [isOpen]);

    const addQuestion = () => {
        setQuestions([...questions, { text: "", options: ["", "", "", ""], correctAnswer: "", marks: 5, timer: 30 }]);
    };

    const removeQuestion = (idx: number) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== idx));
        }
    };

    const handleQuestionChange = (idx: number, field: keyof Question, value: any) => {
        const newQuestions = [...questions];
        newQuestions[idx] = { ...newQuestions[idx], [field]: value };
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIdx: number, oIdx: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIdx].options[oIdx] = value;
        setQuestions(newQuestions);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.classId || !formData.courseId) return toast.error("Select Class and Course");
        if (!formData.deadline) return toast.error("Deployment Due Date is required");

        // Validate questions
        for (let i = 0; i < questions.length; i++) {
            if (!questions[i].text) return toast.error(`Question ${i + 1} is empty`);
            if (!questions[i].correctAnswer) return toast.error(`Question ${i + 1} has no correct choice`);
            if (questions[i].options.some(o => !o)) return toast.error(`Question ${i + 1} has missing options`);
        }

        setLoading(true);
        const tid = toast.loading(initialData ? "Updating assessment..." : "Creating assessment...");

        try {
            const url = initialData ? `/api/live-assessments/${initialData.id}` : "/api/live-assessments";
            const method = initialData ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, questions }),
            });

            if (!res.ok) throw new Error("Failed to process request");

            toast.success(initialData ? "Assessment updated" : "Live Assessment created", { id: tid });
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message, { id: tid });
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen || !mounted) return null;

    const inputClass = "w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3.5 text-xs font-bold text-slate-900 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all";
    const labelClass = "text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2 block ml-1 italic";

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-6xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-fade-up">
                {/* Header */}
                <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                    <div className="flex items-center gap-5">
                        <div className="bg-slate-900 p-4 rounded-2xl text-white shadow-xl">
                            <Zap className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">{initialData ? "Edit Assessment" : "Create Live Assessment"}</h3>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-600">Enter details below</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-xl transition-all">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto px-10 py-8 space-y-10 custom-scrollbar">
                    {fetchingData ? (
                        <div className="py-20 flex flex-col items-center gap-5">
                            <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Loading data...</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="space-y-4">
                                        <label className={labelClass}>Assessment Title</label>
                                        <input
                                            required
                                            className={inputClass}
                                            placeholder="e.g. Mathematics Test 1"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className={labelClass}>Instructions</label>
                                        <textarea
                                            className={`${inputClass} h-28 resize-none`}
                                            placeholder="Provide instructions for the students..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-6 shadow-sm">
                                        <div>
                                            <label className={labelClass}>Class</label>
                                            <select required className={inputClass} value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })}>
                                                <option value="">Select Class</option>
                                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Course</label>
                                            <select required className={inputClass} value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}>
                                                <option value="">Select Course</option>
                                                {courses.filter(c => !formData.classId || c.classId === formData.classId).map(c => (
                                                    <option key={c.id} value={c.id}>{c.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Due Date & Time (Deployment)</label>
                                            <div className="relative">
                                                <input
                                                    type="datetime-local"
                                                    required
                                                    className={inputClass}
                                                    value={formData.deadline}
                                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Assessment Questions</h4>
                                    </div>
                                    <span className="bg-emerald-50 px-4 py-2 rounded-xl text-[8px] font-black uppercase text-emerald-600 tracking-widest border border-emerald-100 italic">{questions.length} Questions</span>
                                </div>

                                <div className="space-y-10">
                                    {questions.map((q, qIdx) => (
                                        <div key={qIdx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative group/card">
                                            <div className="absolute -left-3 top-8 w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-xs shadow-xl italic">
                                                {qIdx + 1}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(qIdx)}
                                                className="absolute -right-3 -top-3 p-3 bg-white text-rose-500 border border-rose-50 rounded-xl shadow-xl opacity-0 group-hover/card:opacity-100 hover:bg-rose-500 hover:text-white transition-all z-10"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>

                                            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                                                <div className="xl:col-span-3 space-y-6">
                                                    <div>
                                                        <label className={labelClass}>Question Text</label>
                                                        <input
                                                            className={`${inputClass} text-base py-4 border-none bg-slate-50/50`}
                                                            placeholder="Enter your question here..."
                                                            value={q.text}
                                                            onChange={(e) => handleQuestionChange(qIdx, 'text', e.target.value)}
                                                        />
                                                    </div>
                                                    Lower

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {q.options.map((opt, oIdx) => {
                                                            const isCorrect = q.correctAnswer === opt && opt !== "";
                                                            return (
                                                                <div key={oIdx} className="relative group/opt">
                                                                    <input
                                                                        className={`${inputClass} pr-12 ${isCorrect ? 'border-emerald-500 bg-emerald-50/20 ring-4 ring-emerald-500/5' : ''}`}
                                                                        placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                                                        value={opt}
                                                                        onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleQuestionChange(qIdx, 'correctAnswer', opt)}
                                                                        className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${isCorrect ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-200 hover:text-emerald-500'}`}
                                                                    >
                                                                        <CheckCircle2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                                    <div>
                                                        <label className={labelClass}>Points</label>
                                                        <input
                                                            type="number"
                                                            className={inputClass}
                                                            value={q.marks}
                                                            onChange={(e) => handleQuestionChange(qIdx, 'marks', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className={labelClass}>Question Timer</label>
                                                        <div className="relative">
                                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                                            <input
                                                                type="number"
                                                                className={`${inputClass} pl-12`}
                                                                value={q.timer}
                                                                onChange={(e) => handleQuestionChange(qIdx, 'timer', e.target.value)}
                                                            />
                                                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-300 uppercase">Secs</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={addQuestion}
                                        className="w-full py-10 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-slate-300 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50/20 transition-all group"
                                    >
                                        <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                                            <Plus className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">Add New Question</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </form>

                {/* Footer */}
                <div className="px-10 py-8 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-slate-400">
                        <Info className="w-4 h-4" />
                        <p className="text-[9px] font-black uppercase tracking-widest italic opacity-60 line-clamp-1">Ensure you select the correct Class and Course before saving.</p>
                    </div>
                    <div className="flex gap-4">
                        <button type="button" onClick={onClose} className="px-8 py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-white transition-all italic">Cancel</button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[9px] shadow-2xl shadow-slate-900/10 hover:bg-emerald-600 transition-all flex items-center gap-4 min-w-[220px] justify-center italic"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <>
                                    <Zap className="w-4 h-4 text-yellow-400" />
                                    <span>{initialData ? "Save Changes" : "Create Assessment"}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
